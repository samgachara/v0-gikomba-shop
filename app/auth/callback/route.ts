import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code  = requestUrl.searchParams.get("code")
  const next  = requestUrl.searchParams.get("next") ?? "/"
  const role  = requestUrl.searchParams.get("role")  // passed from Google OAuth redirect

  if (!code) {
    return NextResponse.redirect(new URL("/", requestUrl.origin))
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ecrttmokkmaqdlsxhlvv.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjcnR0bW9ra21hcWRsc3hobHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMTU2MzAsImV4cCI6MjA4ODc5MTYzMH0.cb8SIczUHH3a6hytKZsFCuQF1qEKT7CIbuoUScrgAE0',
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error("[auth/callback] Session exchange failed:", error.message)
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
    )
  }

  // If this was a Google OAuth signup with a role parameter, update the profile role
  // The trigger may have defaulted to 'buyer' since Google doesn't pass role in metadata
  if (data?.user && role && ['seller', 'buyer'].includes(role)) {
    const userId = data.user.id
    // Get Google name data in case profile was just created with no name
    const googleName = data.user.user_metadata?.full_name || data.user.user_metadata?.name || ''
    const firstName = googleName.split(' ')[0] || null
    const lastName  = googleName.split(' ').slice(1).join(' ') || null

    await supabase.from('profiles').upsert({
      id: userId,
      role,
      first_name: firstName || undefined,
      last_name:  lastName  || undefined,
      is_active: true,
    }, { onConflict: 'id', ignoreDuplicates: false })

    // If signing up as seller, ensure sellers row exists
    if (role === 'seller') {
      await supabase.from('sellers').upsert({
        id: userId,
        store_name: (firstName || googleName || data.user.email?.split('@')[0] || 'Seller') + "'s Shop",
        status: 'active',
        verified: false,
      }, { onConflict: 'id', ignoreDuplicates: true })
    }
  }

  const destination = next === "/" ? "/auth/role-redirect" : next
  return NextResponse.redirect(new URL(destination, requestUrl.origin))
}
