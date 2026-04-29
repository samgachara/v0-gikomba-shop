import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// This page is only hit after Google OAuth via /auth/callback?next=/auth/role-redirect
// It reads the user's role from their profile and sends them to the right dashboard.
// It renders nothing — pure server-side redirect.
export default async function RoleRedirectPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'admin') {
    redirect('/admin')
  }

  if (profile?.role === 'seller') {
    redirect('/seller/dashboard')
  }

  // Buyers and anyone else go home
  redirect('/')
}
