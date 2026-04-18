import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const [
    { count: totalUsers },
    { count: totalProducts },
    { count: totalOrders },
    { count: pendingOrders },
    { data: revenueRows },
    { data: recentOrders },
    { data: topProducts },
    { data: usersByRole },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('orders').select('total').eq('payment_status', 'completed'),
    supabase.from('orders')
      .select('id, total, status, payment_status, payment_method, created_at')
      .order('created_at', { ascending: false }).limit(10),
    supabase.from('products')
      .select('id, title, price, stock, num_reviews, category')
      .eq('is_active', true)
      .order('num_reviews', { ascending: false }).limit(8),
    supabase.from('profiles').select('role'),
  ])

  const totalRevenue = (revenueRows ?? []).reduce((s, o) => s + Number(o.total), 0)
  const roleBreakdown = (usersByRole ?? []).reduce((acc: Record<string, number>, p) => {
    acc[p.role] = (acc[p.role] || 0) + 1
    return acc
  }, {})

  return NextResponse.json({
    totalUsers:    totalUsers ?? 0,
    totalProducts: totalProducts ?? 0,
    totalOrders:   totalOrders ?? 0,
    pendingOrders: pendingOrders ?? 0,
    totalRevenue,
    roleBreakdown,
    recentOrders:  recentOrders ?? [],
    topProducts:   topProducts ?? [],
  })
}
