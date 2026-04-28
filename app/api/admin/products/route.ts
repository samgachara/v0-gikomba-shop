import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

async function requireAdmin(supabase: any, user: any) {
  const { data: p } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return p?.role === 'admin'
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await requireAdmin(supabase, user)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const category   = searchParams.get('category')
  const is_active  = searchParams.get('is_active')
  const is_featured= searchParams.get('is_featured')
  const search     = searchParams.get('search')
  const limit      = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
  const offset     = parseInt(searchParams.get('offset') || '0')

  let query = supabase
    .from('products')
    .select(`
      id, name, price, original_price, category, stock,
      is_active, is_featured, is_new, image_url, num_reviews,
      created_at, seller:sellers!products_seller_id_fkey(store_name)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (category)   query = query.eq('category', category)
  if (is_active  !== null && is_active  !== '') query = query.eq('is_active',   is_active === 'true')
  if (is_featured !== null && is_featured !== '') query = query.eq('is_featured', is_featured === 'true')
  if (search)     query = query.ilike('name', `%${search}%`)

  const { data, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ products: data ?? [], total: count ?? 0 })
}

const UpdateProductSchema = z.object({
  product_id:  z.string().uuid(),
  is_active:   z.boolean().optional(),
  is_featured: z.boolean().optional(),
  is_new:      z.boolean().optional(),
})

const DeleteProductSchema = z.object({
  product_id: z.string().uuid(),
})

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await requireAdmin(supabase, user)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { product_id, ...updates } = UpdateProductSchema.parse(body)
  const { error } = await supabase.from('products').update(updates).eq('id', product_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await requireAdmin(supabase, user)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { product_id } = DeleteProductSchema.parse(body)

  const { count: orderItemCount, error: orderItemError } = await supabase
    .from('order_items')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', product_id)

  if (orderItemError) {
    return NextResponse.json({ error: orderItemError.message }, { status: 500 })
  }

  const hasOrderHistory = (orderItemCount ?? 0) > 0

  if (hasOrderHistory) {
    const { error } = await supabase
      .from('products')
      .update({
        is_active: false,
        is_featured: false,
        is_new: false,
        stock: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', product_id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({
      success: true,
      action: 'archived',
      message: 'Product has order history, so it was archived and removed from the storefront instead of being deleted.',
    })
  }

  const cleanupTables = ['cart_items', 'wishlist_items', 'product_reviews'] as const
  for (const table of cleanupTables) {
    const { error } = await supabase.from(table).delete().eq('product_id', product_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { error } = await supabase.from('products').delete().eq('id', product_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    success: true,
    action: 'deleted',
    message: 'Product deleted permanently.',
  })
}
