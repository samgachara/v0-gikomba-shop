import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized', status: 401 }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Forbidden', status: 403 }
  return { user }
}

export async function GET() {
  const supabase = await createClient()
  const guard = await requireAdmin(supabase)
  if ('error' in guard) return NextResponse.json({ error: guard.error }, { status: guard.status })

  // profiles doesn't store email — we join what we can
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, phone, role, is_active, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ users: data ?? [] })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const guard = await requireAdmin(supabase)
  if ('error' in guard) return NextResponse.json({ error: guard.error }, { status: guard.status })

  const { user_id, role, is_active } = await request.json()
  if (!user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 })

  if (role) {
    // Use the RPC which handles seller row creation + last-admin guard
    const { error } = await supabase.rpc('admin_set_user_role', {
      p_user_id: user_id,
      p_role: role,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (is_active !== undefined) {
    const { error } = await supabase.rpc('admin_set_user_active', {
      p_user_id: user_id,
      p_active: is_active,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
