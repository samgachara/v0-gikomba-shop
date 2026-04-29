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
    .from('orders')
    .select(`
      id, total, status, payment_status, payment_method,
      shipping_city, phone, created_at,
      buyer:profiles!orders_buyer_id_fkey ( first_name, last_name, phone ),
      order_items (
        id, quantity, price,
        product:products ( name, title, image_url )
      )
    `)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ orders: data ?? [] })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const guard = await requireAdmin(supabase)
  if ('error' in guard) return NextResponse.json({ error: guard.error }, { status: guard.status })

  const { order_id, status, payment_status } = await request.json()
  if (!order_id) return NextResponse.json({ error: 'order_id required' }, { status: 400 })

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (status)         updates.status         = status
  if (payment_status) updates.payment_status = payment_status

  const { error } = await supabase.from('orders').update(updates).eq('id', order_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
