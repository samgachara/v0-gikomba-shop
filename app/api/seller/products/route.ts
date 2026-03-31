import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify seller role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'seller') {
    return NextResponse.json({ error: 'Only sellers can add products' }, { status: 403 })
  }

  const body = await request.json()
  const { name, description, price, original_price, category, stock, image_url } = body

  // Validation
  if (!name || !price || !category || !stock) {
    return NextResponse.json(
      { error: 'Name, price, category and stock are required' },
      { status: 400 }
    )
  }
  if (isNaN(Number(price)) || Number(price) <= 0) {
    return NextResponse.json({ error: 'Price must be a positive number' }, { status: 400 })
  }
  if (isNaN(Number(stock)) || Number(stock) < 0) {
    return NextResponse.json({ error: 'Stock must be 0 or more' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      name:           name.trim(),
      description:    description?.trim() || null,
      price:          Number(price),
      original_price: original_price ? Number(original_price) : null,
      category:       category.trim(),
      stock:          Number(stock),
      image_url:      image_url?.trim() || null,
      seller_id:      user.id,
      is_new:         true,
      is_featured:    false,
      rating:         0,
      review_count:   0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
