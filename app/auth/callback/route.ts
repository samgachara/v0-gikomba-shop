import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function sanitizeRedirectPath(next: string | null): string {
  if (!next) return '/'
  try {
    if (next.startsWith('http') || next.startsWith('//') || !next.startsWith('/')) return '/'
    const url = new URL(next, 'https://placeholder.internal')
    if (url.host !== 'placeholder.internal') return '/'
    return url.pathname + url.search
  } catch { return '/' }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = sanitizeRedirectPath(searchParams.get('next'))
  const roleParam = searchParams.get('role') // passed from Google OAuth signup

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const meta = user.user_metadata ?? {}

        // Extract name from Google/email metadata
        let firstName = meta.first_name ?? meta.given_name ?? null
        let lastName = meta.last_name ?? meta.family_name ?? null
        if (!firstName && meta.full_name) {
          const parts = (meta.full_name as string).trim().split(/\s+/)
          firstName = parts[0] ?? null
          lastName = parts.slice(1).join(' ') || null
        }

        // Preserve existing role — never overwrite admin/seller on re-login
        const { data: existing } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        const role = existing?.role ?? roleParam ?? meta.role ?? 'buyer'

        const { error: profileError } = await supabase.from('profiles').upsert(
          {
            id: user.id,
            first_name: firstName,
            last_name: lastName,
            phone: meta.phone ?? null,
            avatar_url: meta.avatar_url ?? null,
            role,
          },
          { onConflict: 'id' },
        )

        if (profileError) {
          console.error('[auth/callback] Profile upsert failed:', profileError.message)
          return NextResponse.redirect(`${origin}/auth/login?error=Profile setup failed`)
        }

        // Redirect by role if no explicit next param
        if (next === '/') {
          if (role === 'admin')  return NextResponse.redirect(`${origin}/dashboard/admin`)
          if (role === 'seller') return NextResponse.redirect(`${origin}/dashboard/seller`)
          return NextResponse.redirect(`${origin}/`)
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=Authentication failed`)
}
