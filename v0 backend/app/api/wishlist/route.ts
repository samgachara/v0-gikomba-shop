import { createClient } from '@/lib/supabase/server'
import { withApiHandler } from '@/lib/api/handler'
import { fail, ok } from '@/lib/api/response'
import { wishlistSchema } from '@/lib/api/schemas'

export const GET = withApiHandler(async ({ userId }) => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('wishlist_items')
    .select(`
      *,
      product:products(*)
    `)
    .eq('user_id', userId)

  if (error) return fail('Failed to fetch wishlist', 500)
  return ok(data)
}, { requireAuth: true })

export const POST = withApiHandler(async ({ userId, body }) => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('wishlist_items')
    .insert({
      user_id: userId,
      product_id: body.product_id,
    })
    .select(`*, product:products(*)`)
    .single()

  if (error) return fail('Unable to add wishlist item', 400)
  return ok(data)
}, { requireAuth: true, schema: wishlistSchema })

export const DELETE = withApiHandler(async ({ userId, body }) => {
  const supabase = await createClient()
  const { error } = await supabase
    .from('wishlist_items')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', body.product_id)

  if (error) return fail('Unable to remove wishlist item', 500)
  return ok({ deleted: true })
}, { requireAuth: true, schema: wishlistSchema })
