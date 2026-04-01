import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function sanitizeRedirectPath(next: string | null): string {
  if (!next) return '/'
  try {
    if (next.startsWith('http') || next.startsWith('//') || !next.startsWith('/')) return '/'
    const url = new URL(next, 'https://placeholder.internal')
    if (url.host !== 'placeholder.internal') return '/'
    return url.pathname + url.search
  } catch (e) {
    console.error('Error sanitizing redirect path:', e)
    return '/'
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = sanitizeRedirectPath(searchParams.get('next'))

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Extract display name from metadata — works for Google, GitHub, and email sign-ups
        const meta = user.user_metadata ?? {}

        // GitHub uses 'user_name' and 'full_name'; Google uses 'given_name'/'family_name'
        let firstName = meta.first_name ?? meta.given_name ?? null
        let lastName = meta.last_name ?? meta.family_name ?? null

        // For GitHub: full_name might be "Sam Gachara" — split it
        if (!firstName && meta.full_name) {
          const parts = (meta.full_name as string).trim().split(/\s+/)
          firstName = parts[0] ?? null
          lastName = parts.slice(1).join(' ') || null
        }

        // GitHub avatar URL
        const avatarUrl = meta.avatar_url ?? null

        const { error: profileError } = await supabase.from('profiles').upsert(
          {
            id: user.id,
            first_name: firstName,
            last_name: lastName,
            phone: meta.phone ?? null,
            avatar_url: avatarUrl,
            // Set default role to 'buyer' if not already set
            role: meta.role ?? 'buyer',
          },
          { onConflict: 'id' },
        )

        if (profileError) {
          console.error('[auth/callback] Profile upsert failed:', profileError.message)
          return NextResponse.redirect(`${origin}/auth/error?message=Profile setup failed`)
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error?message=Authentication failed`)
}
