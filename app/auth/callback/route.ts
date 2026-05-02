import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") ?? "/"

  if (!code) {
    // No code = not a valid callback, redirect home
    return NextResponse.redirect(new URL("/", requestUrl.origin))
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  // Exchange the code for a session — this is all we need to do.
  // The database trigger `handle_new_user` automatically creates the
  // profile row when a new auth.users record is inserted.
  // DO NOT manually insert into profiles here — it causes conflicts.
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error("[auth/callback] Session exchange failed:", error.message)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
    )
  }

  // Send to role-redirect so admins/sellers land on the correct dashboard
  // If a specific next= param was provided (e.g. from a protected page), honour it
  const destination = next === "/" ? "/auth/role-redirect" : next
  return NextResponse.redirect(new URL(destination, requestUrl.origin))
}
