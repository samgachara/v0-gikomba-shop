import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // updateSession MUST run on every request that touches Supabase auth.
  // Without it the server-side client gets no valid session cookie,
  // so every API route returns 401 and the dashboards show nothing.
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match ALL request paths except static files and images.
     * This ensures the session cookie is refreshed on every page
     * and API route — including /admin/*, /seller/*, /api/admin/*, /api/seller/*
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
