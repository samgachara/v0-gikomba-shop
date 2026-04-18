import { getAuthUser, ok, fail, parseBody, parsePagination } from '@/lib/api-handler'
import { orderSchema } from '@/lib/validators/auth'

export async function GET(request: Request) {
  const { user, supabase } = await getAuthUser()
  if (!user) return fail('Unauthorized', 401)

  const { searchParams } = new URL(request.url)
  const { limit, offset, page } = parsePagination(searchParams)

  try {
    const { data: orders, count, error: ordersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (ordersError) {
      console.error('[orders/GET]', ordersError.message)
      return fail('Failed to fetch orders', 500)
    }

    // Fetch order items separately to avoid join errors
    const ordersWithItems = []
    if (orders && orders.length > 0) {
      const orderIds = orders.map((o: { id: string }) => o.id)
      const { data: items } = await supabase
        .from('order_items')
        .select('*, product:products(id, title, name, image_url, price)')
        .in('order_id', orderIds)

      const itemsByOrder: Record<string, unknown[]> = {}
      ;(items ?? []).forEach((item: { order_id: string }) => {
        if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = []
        itemsByOrder[item.order_id].push(item)
      })

      for (const order of orders) {
        ordersWithItems.push({ ...order, items: itemsByOrder[order.id] ?? [] })
      }
    }

    const hasMore = (offset + limit) < (count || 0)
    return ok({ orders: ordersWithItems, meta: { page, limit, total: count || 0, hasMore } })
  } catch (err) {
    console.error('[orders/GET] Unexpected error:', err)
    return fail('Internal server error', 500)
  }
}

export async function POST(request: Request) {
  const { user, supabase } = await getAuthUser()
  if (!user) return fail('Unauthorized', 401)

  const { data: body, error: bodyErr } = await parseBody(request, orderSchema)
  if (bodyErr) return bodyErr

  try {
    const { data, error } = await supabase.rpc('create_order_atomic', {
      p_user_id: user.id,
      p_shipping_address: body.shipping_address,
      p_shipping_city: body.shipping_city,
      p_phone: body.phone,
      p_payment_method: body.payment_method,
    })

    if (error) {
      const msg = error.message.toLowerCase()
      if (msg.includes('insufficient stock') || msg.includes('out of stock'))
        return fail('Insufficient stock for one or more items in your cart', 400)
      if (msg.includes('cart is empty') || msg.includes('empty cart'))
        return fail('Your cart is empty', 400)
      console.error('[orders/POST]', error.message)
      return fail('Failed to create order: ' + error.message, 500)
    }

    if (!data) return fail('Order creation returned no data', 500)
    return ok({ orderId: data }, 201)
  } catch (err) {
    console.error('[orders/POST] Unexpected error:', err)
    return fail('Internal server error', 500)
  }
}
