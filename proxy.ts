import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { SITE_HOST, SITE_URL } from '@/lib/site'

export async function proxy(request: NextRequest) {
  if (request.nextUrl.hostname === `www.${SITE_HOST}`) {
    const redirectUrl = new URL(`${SITE_URL}${request.nextUrl.pathname}${request.nextUrl.search}`)
    return NextResponse.redirect(redirectUrl, 308)
  }

  const response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  const isAdminRoute  = path.startsWith('/dashboard/admin')
  const isSellerRoute = path.startsWith('/dashboard/seller')
  const isAuthRoute   = path.startsWith('/auth/login') || path.startsWith('/auth/sign-up')

  if (!user && (isAdminRoute || isSellerRoute)) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirectTo', path)
    return NextResponse.redirect(loginUrl)
  }

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role ?? 'buyer'

    if (isAdminRoute && role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    if (isSellerRoute && !['seller', 'admin'].includes(role)) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    if (isAuthRoute) {
      if (role === 'admin')  return NextResponse.redirect(new URL('/dashboard/admin', request.url))
      if (role === 'seller') return NextResponse.redirect(new URL('/dashboard/seller', request.url))
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
