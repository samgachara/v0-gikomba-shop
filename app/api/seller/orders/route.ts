import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get this seller's product IDs
  const { data: products } = await supabase
    .from('products')
    .select('id, name')
    .eq('seller_id', user.id)

  const productIds = (products ?? []).map(p => p.id)

  if (productIds.length === 0) return NextResponse.json([])

  // Get order items for seller's products
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('*, product:products(name, image_url)')
    .in('product_id', productIds)

  const orderIds = [...new Set((orderItems ?? []).map(i => i.order_id))]

  if (orderIds.length === 0) return NextResponse.json([])

  // Get the actual orders
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .in('id', orderIds)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Attach only the seller's items to each order
  const result = (orders ?? []).map(order => ({
    ...order,
    items: (orderItems ?? []).filter(i => i.order_id === order.id),
  }))

  return NextResponse.json(result)
}
