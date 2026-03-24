import { createClient } from '@/lib/supabase/server'
import { withApiHandler } from '@/lib/api/handler'
import { fail, ok } from '@/lib/api/response'
import { orderCreateSchema } from '@/lib/api/schemas'
import { createOrderAtomic } from '@/lib/services/order-service'

export const GET = withApiHandler(
  async ({ userId, request }) => {
    const page = Number(request.nextUrl.searchParams.get('page') ?? '1')
    const limit = Math.min(Number(request.nextUrl.searchParams.get('limit') ?? '10'), 50)
    const from = (Math.max(page, 1) - 1) * limit
    const to = from + limit - 1
    const supabase = await createClient()

    const { data, error, count } = await supabase
      .from('orders')
      .select(`
      *,
      items:order_items(
        *,
        product:products(*)
      )
    `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) return fail('Failed to fetch orders', 500)
    return ok({ items: data ?? [], pagination: { page, limit, total: count ?? 0 } })
  },
  { requireAuth: true },
)

export const POST = withApiHandler(
  async ({ userId, body }) => {
    const orderResult = await createOrderAtomic({
      userId,
      shipping_address: body.shipping_address,
      shipping_city: body.shipping_city,
      phone: body.phone,
      payment_method: body.payment_method,
    })

    if ('error' in orderResult) return fail(orderResult.error, 400)

    const supabase = await createClient()
    const { data: completeOrder, error } = await supabase
      .from('orders')
      .select(`
      *,
      items:order_items(
        *,
        product:products(*)
      )
    `)
      .eq('id', orderResult.data.id)
      .single()

    if (error || !completeOrder) return fail('Order created but could not be loaded', 500)
    return ok(completeOrder, 201)
  },
  { requireAuth: true, schema: orderCreateSchema },
)
