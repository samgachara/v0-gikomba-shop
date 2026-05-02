import { updateSession } from '@/lib/supabase/middleware'
import type { NextRequest } from 'next/server'

// Next.js 16: proxy.ts replaces middleware.ts
// Must be a default export. Function name is arbitrary.
export default async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
