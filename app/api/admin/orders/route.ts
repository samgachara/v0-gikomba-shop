import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

async function requireAdmin(supabase: any, user: any) {
  const { data: p } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return p?.role === 'admin'
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await requireAdmin(supabase, user)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const status  = searchParams.get('status')
  const payment = searchParams.get('payment_status')
  const limit   = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
  const offset  = parseInt(searchParams.get('offset') || '0')

  let query = supabase
    .from('orders')
    .select(`
      id, total, status, payment_status, payment_method,
      shipping_address, shipping_city, phone, created_at,
      buyer:profiles!orders_buyer_id_fkey(first_name, last_name),
      seller:sellers!orders_seller_id_fkey(store_name),
      order_items(quantity, price, product:products(name, image_url))
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status)  query = query.eq('status', status)
  if (payment) query = query.eq('payment_status', payment)

  const { data, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ orders: data ?? [], total: count ?? 0 })
}

const UpdateOrderSchema = z.object({
  order_id: z.string().uuid(),
  status: z.enum(['pending','confirmed','shipped','delivered','cancelled']).optional(),
  payment_status: z.enum(['pending','completed','failed','refunded']).optional(),
})

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await requireAdmin(supabase, user)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { order_id, status, payment_status } = UpdateOrderSchema.parse(body)

  const updates: Record<string, string> = {}
  if (status)         updates.status = status
  if (payment_status) updates.payment_status = payment_status

  const { error } = await supabase.from('orders').update(updates).eq('id', order_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
