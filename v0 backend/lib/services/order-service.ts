import { createClient } from '@/lib/supabase/server'

export async function createOrderAtomic(input: {
  userId: string
  shipping_address: string
  shipping_city: string
  phone: string
  payment_method: 'mpesa' | 'card'
}) {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('create_order_from_cart', {
    p_user_id: input.userId,
    p_shipping_address: input.shipping_address,
    p_shipping_city: input.shipping_city,
    p_phone: input.phone,
    p_payment_method: input.payment_method,
  })

  if (error || !data) {
    return { error: 'Unable to create order. Please verify stock and cart.' as const }
  }

  return { data: data as { id: string; total: number } }
}
