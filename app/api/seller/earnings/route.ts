import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { handleError } from '@/lib/api-error'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const limit  = Math.min(parseInt(searchParams.get('limit')  || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    const { data: payouts, error, count } = await supabase
      .from('seller_payouts')
      .select(
        'id, amount, commission_amount, net_amount, status, ' +
        'mpesa_phone, mpesa_receipt, notes, period_start, period_end, created_at',
        { count: 'exact' }
      )
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    // Return as array so dashboard can do: Array.isArray(d) ? d : d.payouts ?? []
    return NextResponse.json(payouts ?? [])
  } catch (error) {
    return handleError(error)
  }
}
