import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { User, SupabaseClient } from '@supabase/supabase-js'
import type { ZodSchema } from 'zod'

export type ApiResponse<T = any> = {
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

export function successResponse<T>(data: T, meta?: ApiResponse['meta'], status = 200) {
  return NextResponse.json({ success: true, data, meta }, { status })
}

export function errorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status })
}

export async function getSupabase(): Promise<{ client: SupabaseClient; error: NextResponse | null }> {
  try {
    const client = await createClient()
    return { client, error: null }
  } catch (err) {
    console.error('Supabase init error:', err)
    return { client: null as any, error: errorResponse('Internal Server Error', 500) }
  }
}

export async function requireAuth(): Promise<{ user: User; error: NextResponse | null }> {
  const { client: supabase, error: dbError } = await getSupabase()
  if (dbError) return { user: null as any, error: dbError }
  
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return { user: null as any, error: errorResponse('Unauthorized', 401) }
  }
  return { user, error: null }
}

export async function validateBody<T>(
  request: Request,
  schema: ZodSchema<T>,
): Promise<{ data: T; error: NextResponse | null }> {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return { data: null as any, error: errorResponse('Invalid JSON body', 400) }
  }
  const result = schema.safeParse(raw)
  if (!result.success) {
    return { data: null as any, error: errorResponse(result.error.errors[0].message, 400) }
  }
  return { data: result.data, error: null }
}

export function getPaginationParams(searchParams: URLSearchParams) {
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20'), 1), 100)
  const page = Math.max(parseInt(searchParams.get('page') || '1'), 1)
  const offset = (page - 1) * limit
  return { limit, offset, page }
}

export async function withErrorHandler(fn: () => Promise<NextResponse>) {
  try {
    return await fn()
  } catch (err: any) {
    console.error('API Error:', err)
    return errorResponse(err.message || 'Internal Server Error', 500)
  }
}
