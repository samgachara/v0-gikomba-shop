import { getAuthUser, ok, fail, parseBody, parsePagination } from '@/lib/api-handler'
import { orderSchema } from '@/lib/validators/auth'
import { type Order, type OrderItem } from '@/lib/supabase/types'

export async function GET(request: Request) {
  const { user, supabase } = await getAuthUser()
  if (!user) return fail('Unauthorized', 401)

  const { searchParams } = new URL(request.url)
  const { limit, offset, page } = parsePagination(searchParams)

  try {
    // First, get orders without the nested relationship to avoid "relationship not found" errors
    const { data: orders, count, error: ordersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (ordersError) {
      console.error('[orders/GET] Orders fetch error:', ordersError.message)
      return fail('Failed to fetch orders', 500)
    }

    // If we have orders, fetch their items separately to handle relationship errors gracefully
    const ordersWithItems: Order[] = []
    
    if (orders && orders.length > 0) {
      const orderIds = orders.map(o => o.id)
      
      // Fetch order items
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds)

      if (itemsError) {
        console.error('[orders/GET] Order items fetch error:', itemsError.message)
        // Return orders without items rather than failing completely
      }

      // Create a map of order items
      const itemsByOrder: Record<string, OrderItem[]> = {}
      orderItems?.forEach((item: OrderItem) => {
        if (!itemsByOrder[item.order_id]) {
          itemsByOrder[item.order_id] = []
        }
        itemsByOrder[item.order_id].push(item)
      })

      // Combine orders with their items
      orders.forEach((order: Order) => {
        ordersWithItems.push({
          ...order,
          order_items: itemsByOrder[order.id] || []
        })
      })
    }

    const hasMore = (offset + limit) < (count || 0)
    
    return ok({ 
      orders: ordersWithItems, 
      meta: { page, limit, total: count || 0, hasMore } 
    })
    
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
    // Check if RPC function exists by attempting to call it
    const { data, error } = await supabase.rpc('create_order_atomic', {
      p_user_id: user.id,
      p_shipping_address: body.shipping_address,
      p_shipping_city: body.shipping_city,
      p_phone: body.phone,
      p_payment_method: body.payment_method,
    })

    if (error) {
      // Handle specific error cases from your PostgreSQL function
      const errorMsg = error.message.toLowerCase()
      
      if (errorMsg.includes('insufficient stock') || errorMsg.includes('out of stock')) {
        return fail('Insufficient stock for one or more items in your cart', 400)
      }
      
      if (errorMsg.includes('cart is empty') || errorMsg.includes('empty cart')) {
        return fail('Your cart is empty', 400)
      }
      
      if (errorMsg.includes('function') && errorMsg.includes('does not exist')) {
        console.error('[orders/POST] RPC function missing:', error.message)
        return fail('Order processing is temporarily unavailable', 500)
      }

      console.error('[orders/POST] RPC error:', error.message)
      return fail('Failed to create order: ' + error.message, 500)
    }

    if (!data) {
      return fail('Order creation returned no data', 500)
    }

    return ok({ orderId: data }, 201)
    
  } catch (err) {
    console.error('[orders/POST] Unexpected error:', err)
    return fail('Internal server error', 500)
  }
}
