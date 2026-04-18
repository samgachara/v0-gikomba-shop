import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: products } = await supabase
    .from('products').select('id').eq('seller_id', user.id)

  const productIds = (products ?? []).map(p => p.id)
  const productCount = productIds.length

  if (productIds.length === 0) {
    return NextResponse.json({ totalSales: 0, pendingOrders: 0, productCount: 0, totalOrders: 0, avgOrderValue: 0 })
  }

  const { data: orderItems } = await supabase
    .from('order_items').select('order_id, quantity, price').in('product_id', productIds)

  const orderIds = [...new Set((orderItems ?? []).map(i => i.order_id))]

  if (orderIds.length === 0) {
    return NextResponse.json({ totalSales: 0, pendingOrders: 0, productCount, totalOrders: 0, avgOrderValue: 0 })
  }

  const { data: orders } = await supabase
    .from('orders').select('id, status, total').in('id', orderIds)

  const deliveredOrders = (orders ?? []).filter(o => o.status === 'delivered')
  const totalSales     = deliveredOrders.reduce((sum, o) => sum + Number(o.total), 0)
  const pendingOrders  = (orders ?? []).filter(o => o.status === 'pending').length
  const totalOrders    = orders?.length ?? 0
  const avgOrderValue  = deliveredOrders.length > 0
    ? Math.round(totalSales / deliveredOrders.length)
    : 0

  return NextResponse.json({ totalSales, pendingOrders, productCount, totalOrders, avgOrderValue })
}
