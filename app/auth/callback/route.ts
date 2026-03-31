import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function sanitizeRedirectPath(next: string | null): string {
  if (!next) return '/'
  try {
    // Ensure the redirect path is relative and safe
    if (next.startsWith('http') || next.startsWith('//') || !next.startsWith('/')) return '/'
    const url = new URL(next, 'https://placeholder.internal') // Use a dummy base URL for parsing
    if (url.host !== 'placeholder.internal') return '/' // Should not be an external URL
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
        // Upsert profile data, ensuring a default role for new users
        const { error: profileError } = await supabase.from('profiles').upsert(
          {
            id: user.id,
            first_name: user.user_metadata?.first_name ?? null,
            last_name: user.user_metadata?.last_name ?? null,
            phone: user.user_metadata?.phone ?? null,
            // Set default role to 'buyer' if not already set or provided by OAuth
            role: user.user_metadata?.role ?? 'buyer',
          },
          { onConflict: 'id' }, // Update if user exists, insert if new
        )
        if (profileError) {
          console.error('[auth/callback] Profile upsert failed:', profileError.message)
          // Optionally redirect to an error page or show a message
          return NextResponse.redirect(`${origin}/auth/error?message=Profile setup failed`)
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If code is missing or exchange fails, redirect to auth error page
  return NextResponse.redirect(`${origin}/auth/error?message=Authentication failed`)
}
