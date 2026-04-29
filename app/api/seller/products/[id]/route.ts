import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function requireSellerOwnsProduct(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productId: string
) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized', status: 401 }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['seller', 'admin'].includes(profile.role)) {
    return { error: 'Seller account required', status: 403 }
  }

  // Admins can update any product; sellers only their own
  if (profile.role !== 'admin') {
    const { data: product } = await supabase
      .from('products')
      .select('seller_id')
      .eq('id', productId)
      .single()

    if (!product) return { error: 'Product not found', status: 404 }
    if (product.seller_id !== user.id) return { error: 'Forbidden', status: 403 }
  }

  return { user, isAdmin: profile.role === 'admin' }
}

// ── PATCH /api/seller/products/[id] ──────────────────────────────────────────
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const guard = await requireSellerOwnsProduct(supabase, params.id)
  if ('error' in guard) return NextResponse.json({ error: guard.error }, { status: guard.status })

  const body = await request.json()
  const { name, description, price, original_price, category, stock, condition, quality_grade, image_url, images, tags, is_active } = body

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (name          !== undefined) { updates.title = name; updates.name = name }
  if (description   !== undefined) updates.description   = description
  if (price         !== undefined) updates.price         = Number(price)
  if (original_price!== undefined) updates.original_price= original_price ? Number(original_price) : null
  if (category      !== undefined) updates.category      = category
  if (stock         !== undefined) updates.stock         = Number(stock)
  if (condition     !== undefined) updates.condition     = condition
  if (quality_grade !== undefined) updates.quality_grade = quality_grade
  if (image_url     !== undefined) updates.image_url     = image_url
  if (images        !== undefined) updates.images        = images
  if (tags          !== undefined) updates.tags          = tags
  if (is_active     !== undefined) updates.is_active     = is_active

  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ product: data })
}

// ── DELETE /api/seller/products/[id] ─────────────────────────────────────────
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const guard = await requireSellerOwnsProduct(supabase, params.id)
  if ('error' in guard) return NextResponse.json({ error: guard.error }, { status: guard.status })

  // Check for order history
  const { count } = await supabase
    .from('order_items')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', params.id)

  if ((count ?? 0) > 0) {
    // Archive instead of delete
    const { error } = await supabase
      .from('products')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', params.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, archived: true, message: 'Product archived (has order history)' })
  }

  const { error } = await supabase.from('products').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, archived: false, message: 'Product deleted' })
}
