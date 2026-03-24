import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withApiHandler } from '@/lib/api/handler'
import { fail, ok } from '@/lib/api/response'
import { cartDeleteSchema, cartPostSchema, cartPutSchema } from '@/lib/api/schemas'

export const GET = withApiHandler(
  async ({ userId }) => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('cart_items')
      .select('*, product:products(*)')
      .eq('user_id', userId)

    if (error) return fail('Failed to fetch cart', 500)
    return ok(data)
  },
  { requireAuth: true },
)

export const POST = withApiHandler(
  async ({ userId, body }) => {
    const supabase = await createClient()
    const { data: upserted, error: upsertError } = await supabase.rpc('upsert_cart_item', {
      p_user_id: userId,
      p_product_id: body.product_id,
      p_quantity: body.quantity,
    })

    if (upsertError || !upserted) return fail('Unable to add item to cart', 400)

    const { data, error } = await supabase
      .from('cart_items')
      .select('*, product:products(*)')
      .eq('id', upserted)
      .single()

    if (error) return fail('Unable to load cart item', 500)
    return ok(data)
  },
  { requireAuth: true, schema: cartPostSchema },
)

export const PUT = withApiHandler(
  async ({ userId, body }) => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity: body.quantity })
      .eq('id', body.id)
      .eq('user_id', userId)
      .select('*, product:products(*)')
      .single()

    if (error) return fail('Unable to update cart item', 500)
    return ok(data)
  },
  { requireAuth: true, schema: cartPutSchema },
)

export const DELETE = withApiHandler(
  async ({ userId, body }) => {
    const supabase = await createClient()
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', body.id)
      .eq('user_id', userId)

    if (error) return fail('Unable to remove cart item', 500)
    return ok({ deleted: true })
  },
  { requireAuth: true, schema: cartDeleteSchema },
)
