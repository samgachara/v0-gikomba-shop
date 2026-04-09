import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'
import type { ZodSchema } from 'zod'

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function fail(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status })
}

export async function getAuthUser(): Promise<{
  user: User | null
  supabase: Awaited<ReturnType<typeof createClient>>
}> {
  const supabase = await createClient()
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    // Auth errors for unauthenticated users are expected — don't log as errors
    if (error && error.message !== 'Auth session missing!') {
      console.warn('[getAuthUser] Unexpected auth error:', error.message)
    }
    return { user: user ?? null, supabase }
  } catch (err) {
    console.error('[getAuthUser] Unexpected error:', err)
    return { user: null, supabase }
  }
}

export async function parseBody<T>(
  request: Request,
  schema: ZodSchema<T>,
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return { data: null, error: fail('Invalid JSON body', 400) }
  }
  const result = schema.safeParse(raw)
  if (!result.success)
    return { data: null, error: fail(result.error.errors[0].message, 400) }
  return { data: result.data, error: null }
}

export function sanitizeSearch(input: string): string {
  return input
    .trim()
    .slice(0, 100)
    .replace(/[%_\\]/g, (c) => `\\${c}`)
    .replace(/['";`]/g, '')
}

export function parsePagination(searchParams: URLSearchParams) {
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20'), 1), 100)
  const page = Math.max(parseInt(searchParams.get('page') || '1'), 1)
  const offset = (page - 1) * limit
  return { limit, offset, page }
}
