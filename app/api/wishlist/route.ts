import { z } from 'zod'
import { getAuthUser, ok, fail, parseBody } from '@/lib/api-handler'

const schema = z.object({ product_id: z.string().uuid('Invalid product ID') })

export async function GET() {
  try {
    const { user, supabase } = await getAuthUser()
    if (!user) return fail('Unauthorized', 401)

    const { data, error } = await supabase
      .from('wishlist_items')
      .select('*, product:products(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[wishlist/GET] Database error:', error.message)
      // If the join fails, try without the join to see if it's a relationship issue
      const { data: simpleData, error: simpleError } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('user_id', user.id)
      
      if (simpleError) {
        return fail(`Database error: ${simpleError.message}`, 500)
      }
      return ok(simpleData)
    }

    return ok(data)
  } catch (err) {
    console.error('[wishlist/GET] Unexpected error:', err)
    return fail('An unexpected error occurred', 500)
  }
}

export async function POST(request: Request) {
  try {
    const { user, supabase } = await getAuthUser()
    if (!user) return fail('Unauthorized', 401)

    const { data: body, error: bodyErr } = await parseBody(request, schema)
    if (bodyErr) return bodyErr

    const { data: product } = await supabase
      .from('products')
      .select('id')
      .eq('id', body.product_id)
      .maybeSingle()

    if (!product) return fail('Product not found', 404)

    const { data, error } = await supabase
      .from('wishlist_items')
      .upsert(
        { user_id: user.id, product_id: body.product_id },
        { onConflict: 'user_id,product_id', ignoreDuplicates: true }
      )
      .select('*, product:products(*)')
      .maybeSingle()

    if (error) {
      console.error('[wishlist/POST] Database error:', error.message)
      return fail(`Failed to add to wishlist: ${error.message}`, 500)
    }

    return ok(data ?? { message: 'Already in wishlist' }, 201)
  } catch (err) {
    console.error('[wishlist/POST] Unexpected error:', err)
    return fail('An unexpected error occurred', 500)
  }
}

export async function DELETE(request: Request) {
  try {
    const { user, supabase } = await getAuthUser()
    if (!user) return fail('Unauthorized', 401)

    const { data: body, error: bodyErr } = await parseBody(request, schema)
    if (bodyErr) return bodyErr

    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', body.product_id)

    if (error) {
      console.error('[wishlist/DELETE] Database error:', error.message)
      return fail(`Failed to remove from wishlist: ${error.message}`, 500)
    }

    return ok({ removed: true })
  } catch (err) {
    console.error('[wishlist/DELETE] Unexpected error:', err)
    return fail('An unexpected error occurred', 500)
  }
}
