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
  const roleParam = searchParams.get('role')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const meta = user.user_metadata ?? {}

        // Extract name from Google/email metadata
        let firstName = meta.first_name ?? meta.given_name ?? null
        let lastName  = meta.last_name  ?? meta.family_name ?? null
        if (!firstName && meta.full_name) {
          const parts = (meta.full_name as string).trim().split(/\s+/)
          firstName = parts[0] ?? null
          lastName  = parts.slice(1).join(' ') || null
        }

        // Check if profile already exists (handle_new_user trigger creates it on INSERT)
        const { data: existing } = await supabase
          .from('profiles')
          .select('id, role, first_name, last_name')
          .eq('id', user.id)
          .single()

        let role = 'buyer'

        if (!existing) {
          // Trigger didn't fire (edge case) — create profile manually
          role = roleParam === 'seller' ? 'seller' : 'buyer'
          const { error: insertErr } = await supabase.from('profiles').insert({
            id: user.id, first_name: firstName, last_name: lastName,
            phone: meta.phone ?? null, avatar_url: meta.avatar_url ?? null, role,
          })
          // Don't block login on insert failure — user can update profile later
          if (insertErr) console.error('[auth/callback] Profile insert failed:', insertErr.message)
        } else {
          // Profile exists — preserve role, only fill in missing name fields
          role = existing.role ?? 'buyer'
          const patch: Record<string, unknown> = {}
          if (!existing.first_name && firstName) patch.first_name = firstName
          if (!existing.last_name  && lastName)  patch.last_name  = lastName
          if (meta.avatar_url) patch.avatar_url = meta.avatar_url
          if (Object.keys(patch).length > 0) {
            await supabase.from('profiles').update(patch).eq('id', user.id)
          }
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
