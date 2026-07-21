import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // ── Lowercase redirect ────────────────────────────────────────────────────
  // If the URL path has uppercase letters, redirect to lowercase.
  // Prevents 404s when users type Gikomba.shop or share capitalised links.
  const { pathname, search, origin } = request.nextUrl
  if (pathname !== pathname.toLowerCase()) {
    return NextResponse.redirect(
      new URL(origin + pathname.toLowerCase() + search)
    )
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ecrttmokkmaqdlsxhlvv.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjcnR0bW9ra21hcWRsc3hobHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMTU2MzAsImV4cCI6MjA4ODc5MTYzMH0.cb8SIczUHH3a6hytKZsFCuQF1qEKT7CIbuoUScrgAE0'

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        )
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        )
      },
    },
  })

  // IMPORTANT: Do not put any code between createServerClient and getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()


  // ── Fetch role from profiles (cached in cookie for 5 mins) ────────────────
  let role: string | null = null
  if (user) {
    // Check cookie cache first — avoids a DB hit on every single request
    const cachedRole = request.cookies.get('_role')?.value
    if (cachedRole) {
      role = cachedRole
    } else {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      role = profile?.role ?? null
      // Cache role in cookie for 5 minutes
      if (role) supabaseResponse.cookies.set('_role', role, { maxAge: 300, path: '/', sameSite: 'lax' })
    }
  } else {
    // Clear role cookie on logout
    supabaseResponse.cookies.delete('_role')
  }

  // ── Admin: locked to your email only ──────────────────────────────────────
  if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard/admin')) {
    if (!user || user.email !== 'samgachara5@gmail.com') {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }
  }

  // ── Seller: must be logged in with role = 'seller' or 'admin' ─────────────
  if (pathname.startsWith('/seller') || pathname.startsWith('/dashboard/seller')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }
    if (role !== 'seller' && role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  // ── Post-login redirect: send users to their dashboard automatically ───────
  if (pathname === '/auth/login' && user) {
    const url = request.nextUrl.clone()
    if (user.email === 'samgachara5@gmail.com') {
      url.pathname = '/dashboard/admin'
    } else if (role === 'seller') {
      url.pathname = '/dashboard/seller'
    } else {
      url.pathname = '/'
    }
    return NextResponse.redirect(url)
  }

  // ── Other auth-required routes ─────────────────────────────────────────────
  const authRequiredPaths = ['/account', '/checkout', '/wishlist', '/cart']
  if (authRequiredPaths.some(path => pathname.startsWith(path)) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: return supabaseResponse as-is so cookies are forwarded
  return supabaseResponse
}
