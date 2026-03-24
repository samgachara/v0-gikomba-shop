import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ZodError, type ZodSchema } from 'zod'
import type { User } from '@supabase/supabase-js'

// Standardized API response type
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    page?: number
    limit?: number
    total?: number
    hasMore?: boolean
  }
}

// Create standardized success response
export function successResponse<T>(data: T, meta?: ApiResponse['meta']): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    ...(meta && { meta }),
  })
}

// Create standardized error response
export function errorResponse(
  message: string,
  status: number = 400
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  )
}

// Validate request body with Zod schema
export async function validateBody<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<{ data: T; error: null } | { data: null; error: NextResponse<ApiResponse> }> {
  try {
    const body = await request.json()
    const data = schema.parse(body)
    return { data, error: null }
  } catch (err) {
    if (err instanceof ZodError) {
      const message = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      return { data: null, error: errorResponse(message, 400) }
    }
    if (err instanceof SyntaxError) {
      return { data: null, error: errorResponse('Invalid JSON body', 400) }
    }
    return { data: null, error: errorResponse('Invalid request body', 400) }
  }
}

// Validate query parameters with Zod schema
export function validateQuery<T>(
  searchParams: URLSearchParams,
  schema: ZodSchema<T>
): { data: T; error: null } | { data: null; error: NextResponse<ApiResponse> } {
  try {
    const params: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      params[key] = value
    })
    const data = schema.parse(params)
    return { data, error: null }
  } catch (err) {
    if (err instanceof ZodError) {
      const message = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      return { data: null, error: errorResponse(message, 400) }
    }
    return { data: null, error: errorResponse('Invalid query parameters', 400) }
  }
}

// Get Supabase client or return error response
export async function getSupabase() {
  const supabase = await createClient()
  if (!supabase) {
    return { client: null, error: errorResponse('Database not configured', 503) }
  }
  return { client: supabase, error: null }
}

// Get authenticated user or return error response
export async function requireAuth(): Promise<
  { user: User; error: null } | { user: null; error: NextResponse<ApiResponse> }
> {
  const supabase = await createClient()
  
  // If Supabase is not configured, return unauthorized
  if (!supabase) {
    return { user: null, error: errorResponse('Authentication not configured', 401) }
  }

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { user: null, error: errorResponse('Unauthorized', 401) }
  }

  return { user, error: null }
}

// Rate limiting helper (simple in-memory, use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 60,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs }
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now }
  }

  record.count++
  return { allowed: true, remaining: maxRequests - record.count, resetIn: record.resetTime - now }
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now()
  rateLimitMap.forEach((value, key) => {
    if (now > value.resetTime) {
      rateLimitMap.delete(key)
    }
  })
}, 60000)

// Wrap API handler with error handling
export function withErrorHandler<T>(
  handler: () => Promise<NextResponse<ApiResponse<T>>>
): Promise<NextResponse<ApiResponse<T>>> {
  return handler().catch((err: unknown) => {
    console.error('API Error:', err)
    // Don't expose internal error details in production
    return errorResponse('An unexpected error occurred', 500)
  })
}

// Pagination helper
export function getPaginationParams(
  searchParams: URLSearchParams,
  defaultLimit: number = 12
): { page: number; limit: number; offset: number } {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || String(defaultLimit), 10)))
  const offset = (page - 1) * limit

  return { page, limit, offset }
}
