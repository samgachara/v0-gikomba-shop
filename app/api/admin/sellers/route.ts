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

  const { data, error } = await supabase
    .from('sellers')
    .select(`
      id, store_name, status, verified, created_at,
      profiles ( first_name, last_name, phone )
    `)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ sellers: data ?? [] })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const guard = await requireAdmin(supabase)
  if ('error' in guard) return NextResponse.json({ error: guard.error }, { status: guard.status })

  const { seller_id, status, verified } = await request.json()
  if (!seller_id) return NextResponse.json({ error: 'seller_id required' }, { status: 400 })

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (status    !== undefined) updates.status   = status
  if (verified  !== undefined) updates.verified = verified

  const { error } = await supabase.from('sellers').update(updates).eq('id', seller_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
