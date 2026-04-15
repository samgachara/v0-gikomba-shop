import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { handleError, logInfo } from '@/lib/api-error'

// GET /api/seller/earnings — payout history for the authenticated seller
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    logInfo('Seller fetching earnings', { seller_id: user.id })

    // Query seller_payouts directly (the seller_earnings view is an alias for it)
    const { data: payouts, error: payoutsError, count } = await supabase
      .from('seller_payouts')
      .select(
        'id, amount, commission_amount, net_amount, status, mpesa_phone, ' +
        'mpesa_receipt, notes, period_start, period_end, created_at',
        { count: 'exact' }
      )
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (payoutsError) throw payoutsError

    // Aggregate totals
    const { data: totals } = await supabase
      .from('seller_payouts')
      .select('net_amount, status')
      .eq('seller_id', user.id)

    const summary = (totals || []).reduce(
      (acc, row) => {
        acc.total_gross += Number(row.net_amount) || 0
        if (row.status === 'completed') acc.total_paid += Number(row.net_amount) || 0
        if (row.status === 'pending') acc.total_pending += Number(row.net_amount) || 0
        return acc
      },
      { total_gross: 0, total_paid: 0, total_pending: 0 }
    )

    return NextResponse.json({
      data: payouts,
      summary,
      pagination: { total: count, limit, offset },
    })
  } catch (error) {
    return handleError(error)
  }
}
