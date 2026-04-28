import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'

  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, seller_id')
    .eq('id', id)
    .single()

  if (productError) return NextResponse.json({ error: productError.message }, { status: 500 })
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  if (!isAdmin && product.seller_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { count: orderItemCount, error: orderItemError } = await supabase
    .from('order_items')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', id)
  if (orderItemError) return NextResponse.json({ error: orderItemError.message }, { status: 500 })

  const hasOrderHistory = (orderItemCount ?? 0) > 0

  if (hasOrderHistory) {
    const archiveQuery = supabase
      .from('products')
      .update({
        is_active: false,
        is_featured: false,
        is_new: false,
        stock: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (!isAdmin) archiveQuery.eq('seller_id', user.id)

    const { error } = await archiveQuery
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({
      success: true,
      action: 'archived',
      message: 'This product has order history, so it was archived instead of deleted.',
    })
  }

  const cleanupTables = ['cart_items', 'wishlist_items', 'product_reviews'] as const
  for (const table of cleanupTables) {
    const { error } = await supabase.from(table).delete().eq('product_id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const query = supabase.from('products').delete().eq('id', id)
  if (!isAdmin) query.eq('seller_id', user.id)

  const { error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, action: 'deleted', message: 'Product deleted permanently.' })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const { name, description, price, original_price, category, stock, image_url, is_active } = body

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (name !== undefined)           { updates.title = name.trim(); updates.name = name.trim() }
  if (description !== undefined)    updates.description = description?.trim() || null
  if (price !== undefined)          updates.price = Number(price)
  if (original_price !== undefined) updates.original_price = original_price ? Number(original_price) : null
  if (category !== undefined)       updates.category = category.trim()
  if (stock !== undefined)          updates.stock = Number(stock)
  if (image_url !== undefined)      updates.image_url = image_url?.trim() || null
  if (is_active !== undefined)      updates.is_active = Boolean(is_active)

  const query = supabase.from('products').update(updates).eq('id', id)
  if (!isAdmin) query.eq('seller_id', user.id)

  const { data, error } = await query.select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
