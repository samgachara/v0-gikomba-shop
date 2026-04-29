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
    .from('seller_payouts')
    .select(`
      id, seller_id, amount, net_amount, commission_amount,
      status, mpesa_phone, mpesa_receipt, created_at,
      sellers ( store_name )
    `)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ payouts: data ?? [] })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const guard = await requireAdmin(supabase)
  if ('error' in guard) return NextResponse.json({ error: guard.error }, { status: guard.status })

  const { payout_id, status, mpesa_receipt } = await request.json()
  if (!payout_id) return NextResponse.json({ error: 'payout_id required' }, { status: 400 })

  const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() }
  if (mpesa_receipt) updates.mpesa_receipt = mpesa_receipt

  const { error } = await supabase.from('seller_payouts').update(updates).eq('id', payout_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
