import type { SupabaseClient } from '@supabase/supabase-js'

export async function getUserOrders(supabase: SupabaseClient, userId: string) {
  return supabase
    .from('orders')
    .select(`*, items:order_items(*, product:products(*))`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
}

export async function placeOrderTransaction(
  supabase: SupabaseClient,
  params: {
    userId: string
    shippingAddress: string
    shippingCity: string
    phone: string
    paymentMethod: string
  },
) {
  return supabase.rpc('place_order', {
    p_user_id: params.userId,
    p_shipping_address: params.shippingAddress,
    p_shipping_city: params.shippingCity,
    p_phone: params.phone,
    p_payment_method: params.paymentMethod,
  })
}

export function normalizeOrderError(message: string): { msg: string; status: number } {
  if (message.includes('Insufficient stock'))
    return { msg: 'One or more items are out of stock', status: 400 }
  if (message.includes('Cart is empty'))
    return { msg: 'Your cart is empty', status: 400 }
  if (message.includes('not found'))
    return { msg: 'A product in your cart is no longer available', status: 404 }
  return { msg: 'Failed to place order. Please try again.', status: 500 }
}
