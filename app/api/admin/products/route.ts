import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// ── helper: guard admin ───────────────────────────────────────────────────────
async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized', status: 401 }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') return { error: 'Forbidden', status: 403 }
  return { user }
}

// ── GET /api/admin/products ───────────────────────────────────────────────────
export async function GET() {
  const supabase = await createClient()
  const guard = await requireAdmin(supabase)
  if ('error' in guard) return NextResponse.json({ error: guard.error }, { status: guard.status })

  const { data, error } = await supabase
    .from('products')
    .select(`
      id, title, name, price, category, stock,
      is_active, is_featured, is_new,
      image_url, num_reviews, created_at,
      sellers ( store_name )
    `)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Normalise: UI expects product.name and product.seller.store_name
  const products = (data ?? []).map((p: any) => ({
    ...p,
    name: p.name ?? p.title,
    seller: p.sellers ?? null,
  }))

  return NextResponse.json({ products })
}

// ── PATCH /api/admin/products ─────────────────────────────────────────────────
export async function PATCH(request: Request) {
  const supabase = await createClient()
  const guard = await requireAdmin(supabase)
  if ('error' in guard) return NextResponse.json({ error: guard.error }, { status: guard.status })

  const body = await request.json()
  const { product_id, is_active, is_featured, is_new } = body

  if (!product_id) return NextResponse.json({ error: 'product_id required' }, { status: 400 })

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (is_active   !== undefined) updates.is_active   = is_active
  if (is_featured !== undefined) updates.is_featured = is_featured
  if (is_new      !== undefined) updates.is_new      = is_new

  const { error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', product_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// ── DELETE /api/admin/products ────────────────────────────────────────────────
export async function DELETE(request: Request) {
  const supabase = await createClient()
  const guard = await requireAdmin(supabase)
  if ('error' in guard) return NextResponse.json({ error: guard.error }, { status: guard.status })

  const { product_id } = await request.json()
  if (!product_id) return NextResponse.json({ error: 'product_id required' }, { status: 400 })

  // Check if product has order history — if so, archive instead of hard-delete
  const { count } = await supabase
    .from('order_items')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', product_id)

  if ((count ?? 0) > 0) {
    // Safe archive: hide from storefront, keep row for order history
    const { error } = await supabase
      .from('products')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', product_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, archived: true, message: 'Product archived (has order history)' })
  }

  // No order history — safe to hard delete
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', product_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, archived: false, message: 'Product permanently deleted' })
}
