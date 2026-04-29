import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Run all stat queries in parallel
  const [
    usersRes, productsRes, ordersRes, revenueRes, roleRes, recentOrdersRes
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('orders').select('id, status', { count: 'exact' }),
    supabase.from('orders').select('total').eq('payment_status', 'completed'),
    supabase.from('profiles').select('role'),
    supabase.from('orders')
      .select('id, total, status, payment_status, created_at, shipping_city')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const totalRevenue = (revenueRes.data ?? []).reduce((sum: number, o: any) => sum + Number(o.total), 0)
  const roleBreakdown = (roleRes.data ?? []).reduce((acc: Record<string, number>, p: any) => {
    acc[p.role] = (acc[p.role] ?? 0) + 1
    return acc
  }, {})

  const allOrders = ordersRes.data ?? []
  const pendingOrders = allOrders.filter((o: any) => o.status === 'pending').length

  return NextResponse.json({
    totalUsers:     usersRes.count    ?? 0,
    totalProducts:  productsRes.count ?? 0,
    totalOrders:    ordersRes.count   ?? 0,
    pendingOrders,
    totalRevenue,
    roleBreakdown,
    recentOrders:   recentOrdersRes.data ?? [],
    topProducts:    [],
  })
}
