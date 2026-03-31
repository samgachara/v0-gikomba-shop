import { createClient } from '@/lib/supabase/server'

export async function getUserOrders(userId: string) {
  const supabase = await createClient()
  
  // Fetch orders without foreign key relationship syntax
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  if (!orders) return []

  // Fetch order items
  const orderIds = orders.map(o => o.id)
  const { data: orderItems, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .in('order_id', orderIds)

  if (itemsError) {
    console.error('[getUserOrders] Failed to fetch items:', itemsError.message)
    return orders.map(order => ({ ...order, items: [] }))
  }

  if (!orderItems || orderItems.length === 0) {
    return orders.map(order => ({ ...order, items: [] }))
  }

  // Fetch products
  const productIds = [...new Set(orderItems.map((item: any) => item.product_id))]
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('*')
    .in('id', productIds)

  if (prodError) {
    console.error('[getUserOrders] Failed to fetch products:', prodError.message)
  }

  // Merge data
  return orders.map(order => {
    const items = orderItems
      .filter((item: any) => item.order_id === order.id)
      .map((item: any) => ({
        ...item,
        product: products?.find((p: any) => p.id === item.product_id) || null
      }))

    return { ...order, items }
  })
}

export async function placeOrderTransaction(
  userId: string,
  shippingAddress: string,
  shippingCity: string,
  phone: string,
  paymentMethod: string
) {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('place_order', {
    p_user_id: userId,
    p_shipping_address: shippingAddress,
    p_shipping_city: shippingCity,
    p_phone: phone,
    p_payment_method: paymentMethod,
  })

  if (error) throw error
  return data
}

export function normalizeOrderError(error: any): { message: string; status: number } {
  const msg = error?.message || ''

  if (msg.includes('Insufficient stock')) {
    return { message: 'One or more items in your cart are out of stock', status: 400 }
  }
  if (msg.includes('Cart is empty')) {
    return { message: 'Your cart is empty', status: 400 }
  }
  if (msg.includes('not found')) {
    return { message: 'A product in your cart is no longer available', status: 404 }
  }
  if (msg.includes('Unauthorized') || msg.includes('auth')) {
    return { message: 'Please login to continue', status: 401 }
  }

  return { message: 'Failed to place order. Please try again.', status: 500 }
}
