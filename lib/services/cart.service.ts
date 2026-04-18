import type { SupabaseClient } from '@supabase/supabase-js'

export const MAX_QUANTITY = 99

export async function getCartItems(supabase: SupabaseClient, userId: string) {
  return supabase
    .from('cart_items')
    .select('*, product:products(*)')
    .eq('user_id', userId)
}

export async function validateStock(
  supabase: SupabaseClient,
  productId: string,
  quantity: number,
): Promise<{ ok: boolean; stock: number }> {
  const { data } = await supabase
    .from('products')
    .select('stock')
    .eq('id', productId)
    .single()
  if (!data) return { ok: false, stock: 0 }
  return { ok: data.stock >= quantity, stock: data.stock }
}

export async function getExistingCartItem(
  supabase: SupabaseClient,
  userId: string,
  productId: string,
) {
  const { data } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle()
  return data
}
