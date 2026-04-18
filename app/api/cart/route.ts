import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { ok, fail, parseBody } from '@/lib/api-handler'
import { MAX_QUANTITY, getExistingCartItem, validateStock } from '@/lib/services/cart.service'

const addSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().min(1).max(MAX_QUANTITY),
})
const updateSchema = z.object({
  id: z.string().uuid(),
  quantity: z.number().int().min(1).max(MAX_QUANTITY),
})
const deleteSchema = z.object({ id: z.string().uuid() })

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return fail('Unauthorized', 401)
  const { data, error } = await supabase
    .from('cart_items').select('*, product:products(*)').eq('user_id', user.id)
  if (error) { console.error('[cart/GET]', error.message); return fail('Failed to fetch cart', 500) }
  return ok(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return fail('Unauthorized', 401)
  const { data: body, error: bodyErr } = await parseBody(request, addSchema)
  if (bodyErr) return bodyErr
  const { product_id, quantity } = body
  const { ok: inStock, stock } = await validateStock(supabase, product_id, quantity)
  if (!inStock) return fail(`Only ${stock} item(s) left in stock`, 400)
  const existing = await getExistingCartItem(supabase, user.id, product_id)
  if (existing) {
    const newQty = Math.min(existing.quantity + quantity, MAX_QUANTITY)
    if (stock < newQty) return fail(`Only ${stock} item(s) left in stock`, 400)
    const { data, error } = await supabase
      .from('cart_items').update({ quantity: newQty, updated_at: new Date().toISOString() })
      .eq('id', existing.id).eq('user_id', user.id).select('*, product:products(*)').single()
    if (error) { console.error('[cart/POST update]', error.message); return fail('Failed to update cart', 500) }
    return ok(data)
  }
  const { data, error } = await supabase
    .from('cart_items').insert({ user_id: user.id, product_id, quantity })
    .select('*, product:products(*)').single()
  if (error) { console.error('[cart/POST insert]', error.message); return fail('Failed to add to cart', 500) }
  return ok(data, 201)
}

export async function PUT(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return fail('Unauthorized', 401)
  const { data: body, error: bodyErr } = await parseBody(request, updateSchema)
  if (bodyErr) return bodyErr
  const { id, quantity } = body
  const { data: item } = await supabase
    .from('cart_items').select('id, product_id').eq('id', id).eq('user_id', user.id).maybeSingle()
  if (!item) return fail('Cart item not found', 404)
  const { ok: inStock, stock } = await validateStock(supabase, item.product_id, quantity)
  if (!inStock) return fail(`Only ${stock} item(s) left in stock`, 400)
  const { data, error } = await supabase
    .from('cart_items').update({ quantity, updated_at: new Date().toISOString() })
    .eq('id', id).eq('user_id', user.id).select('*, product:products(*)').single()
  if (error) { console.error('[cart/PUT]', error.message); return fail('Failed to update cart', 500) }
  return ok(data)
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return fail('Unauthorized', 401)
  const { data: body, error: bodyErr } = await parseBody(request, deleteSchema)
  if (bodyErr) return bodyErr
  const { error } = await supabase
    .from('cart_items').delete().eq('id', body.id).eq('user_id', user.id)
  if (error) { console.error('[cart/DELETE]', error.message); return fail('Failed to remove item', 500) }
  return ok({ removed: true })
}
