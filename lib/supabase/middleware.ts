import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse
  }

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

  const { pathname } = request.nextUrl

  // ── Fetch role from profiles if user is logged in ──────────────────────────
  let role: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    role = profile?.role ?? null
  }

  // ── Admin dashboard: locked to your email only ─────────────────────────────
  // Pages live at /dashboard/admin — NOT /admin
  if (pathname.startsWith('/dashboard/admin')) {
    if (!user || user.email !== 'samgachara5@gmail.com') {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }
  }

  // ── Seller dashboard: must be logged in with role = 'seller' or 'admin' ────
  // Pages live at /dashboard/seller — NOT /seller
  if (pathname.startsWith('/dashboard/seller')) {
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

  // ── Legacy /admin and /seller pages redirect to dashboard equivalents ───────
  // These pages themselves do the redirect via useRouter, but guard them too
  if (pathname.startsWith('/admin')) {
    if (!user || user.email !== 'samgachara5@gmail.com') {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }
  }

  if (pathname === '/seller' || pathname.startsWith('/seller/')) {
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

  // ── Post-login redirect: send users to their dashboard automatically ────────
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
