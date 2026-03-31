import { getAuthUser, ok, fail, parseBody, parsePagination } from '@/lib/api-handler'
import { orderSchema } from '@/lib/validators/auth'

export async function GET(request: Request) {
  const { user, supabase } = await getAuthUser()
  if (!user) return fail('Unauthorized', 401)

  const { searchParams } = new URL(request.url)
  const { limit, offset, page } = parsePagination(searchParams)

  const { data, count, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(*, product:products(*))
    `, { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('[orders/GET]', error.message)
    return fail('Failed to fetch orders', 500)
  }

  const hasMore = (offset + limit) < (count || 0)
  return ok({ 
    orders: data || [], 
    meta: { page, limit, total: count || 0, hasMore } 
  })
}

export async function POST(request: Request) {
  const { user, supabase } = await getAuthUser()
  if (!user) return fail('Unauthorized', 401)

  const { data: body, error: bodyErr } = await parseBody(request, orderSchema)
  if (bodyErr) return bodyErr

  // Call the atomic PostgreSQL function to create the order
  const { data, error } = await supabase.rpc('create_order_atomic', {
    p_user_id: user.id,
    p_shipping_address: body.shipping_address,
    p_shipping_city: body.shipping_city,
    p_phone: body.phone,
    p_payment_method: body.payment_method,
  })

  if (error) {
    if (error.message.includes('Insufficient stock')) {
      return fail(error.message, 400)
    }
    if (error.message.includes('Cart is empty')) {
      return fail(error.message, 400)
    }
    console.error('[orders/POST]', error.message)
    return fail('Failed to create order', 500)
  }

  return ok({ orderId: data }, 201)
}
