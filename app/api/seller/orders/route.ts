import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { handleError, logInfo } from '@/lib/api-error'

// GET /api/seller/orders — orders for the authenticated seller's products
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status')

    logInfo('Seller fetching orders', { seller_id: user.id })

    // orders.seller_id references sellers.id — matches live schema
    let query = supabase
      .from('orders')
      .select(
        `id, status, total, payment_status, payment_method, created_at,
         shipping_address, shipping_city, phone,
         items:order_items(*, product:products(title, name, image_url, price)),
         buyer:profiles!orders_buyer_id_fkey(id, first_name, last_name, phone)`,
        { count: 'exact' }
      )
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({ data, pagination: { total: count, limit, offset } })
  } catch (error) {
    return handleError(error)
  }
}
