import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function handleError(error: unknown) {
  console.error('[API Error]', error)

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation error',
        details: error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      },
      { status: 400 }
    )
  }

  // Handle custom API errors
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status }
    )
  }

  // Handle Supabase errors
  if (error instanceof Error && 'message' in error) {
    const message = error.message || 'Internal server error'
    const status = message.includes('not found') ? 404 : 500
    return NextResponse.json({ error: message }, { status })
  }

  // Default error response
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}

export function logInfo(message: string, data?: any) {
  console.log(`[API Info] ${message}`, data || '')
}
