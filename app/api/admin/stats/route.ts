import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Call the DB function — it returns snake_case keys
  const { data, error } = await supabase.rpc('admin_get_platform_stats')
  if (error) {
    // If access denied (not admin), return 403
    if (error.message.includes('Access denied')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Map snake_case DB keys → camelCase keys the frontend expects
  const stats = {
    totalUsers:     Number(data.total_users     ?? 0),
    totalProducts:  Number(data.total_products  ?? 0),
    totalOrders:    Number(data.total_orders    ?? 0),
    pendingOrders:  Number(data.pending_orders  ?? 0),
    totalRevenue:   Number(data.total_revenue   ?? 0),
    recentOrders:   [],
    topProducts:    [],
    roleBreakdown: {
      buyer:  Number(data.total_buyers  ?? 0),
      seller: Number(data.total_sellers ?? 0),
      // total_users - buyers - sellers = admins
      admin:  Number(data.total_users ?? 0) - Number(data.total_buyers ?? 0) - Number(data.total_sellers ?? 0),
    },
    // Extra fields available if you want to use them later
    activeSellers:         Number(data.active_sellers          ?? 0),
    verifiedSellers:       Number(data.verified_sellers        ?? 0),
    completedOrders:       Number(data.completed_orders        ?? 0),
    totalRevenuePlatform:  Number(data.total_revenue           ?? 0),
    platformCommission:    Number(data.platform_commission     ?? 0),
    revenueToday:          Number(data.revenue_today           ?? 0),
    revenueThisMonth:      Number(data.revenue_this_month      ?? 0),
    pendingPayouts:        Number(data.pending_payouts         ?? 0),
    newsletterSubscribers: Number(data.newsletter_subscribers  ?? 0),
    contactMessages:       Number(data.contact_messages        ?? 0),
  }

  return NextResponse.json(stats)
}
