import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function requireSeller(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized', status: 401 }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single()
  if (!profile || !['seller', 'admin'].includes(profile.role)) {
    return { error: 'Seller account required', status: 403 }
  }
  if (!profile.is_active) return { error: 'Account suspended', status: 403 }
  return { user }
}

// ── GET /api/seller/products ─────────────────────────────────────────────────
export async function GET() {
  const supabase = await createClient()
  const guard = await requireSeller(supabase)
  if ('error' in guard) return NextResponse.json({ error: guard.error }, { status: guard.status })

  // Query products directly — seller only sees their own (RLS + explicit filter)
  const { data, error } = await supabase
    .from('products')
    .select(`
      id, title, name, price, original_price, category, stock,
      is_active, is_featured, is_new, condition, quality_grade,
      image_url, images, tags, rating, num_reviews, created_at, updated_at
    `)
    .eq('seller_id', guard.user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const products = (data ?? []).map((p: any) => ({
    ...p,
    name: p.name ?? p.title,
  }))

  return NextResponse.json(products)
}

// ── POST /api/seller/products ────────────────────────────────────────────────
export async function POST(request: Request) {
  const supabase = await createClient()
  const guard = await requireSeller(supabase)
  if ('error' in guard) return NextResponse.json({ error: guard.error }, { status: guard.status })

  const body = await request.json()
  const { name, description, price, original_price, category, stock, condition, quality_grade, image_url, images, tags } = body

  if (!name || !price || !category) {
    return NextResponse.json({ error: 'name, price, and category are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      seller_id:      guard.user.id,
      title:          name,
      name,
      description,
      price:          Number(price),
      original_price: original_price ? Number(original_price) : null,
      category,
      stock:          Number(stock ?? 0),
      condition:      condition ?? 'used',
      quality_grade:  quality_grade ?? null,
      image_url:      image_url ?? null,
      images:         images ?? [],
      tags:           tags ?? [],
      is_active:      true,
      is_new:         true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
