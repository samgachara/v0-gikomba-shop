import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  // Ensure this product belongs to this seller
  const { data: product } = await supabase
    .from('products').select('id').eq('id', id).eq('seller_id', user.id).maybeSingle()

  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  const { error } = await supabase.from('products').delete().eq('id', id).eq('seller_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: true })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const { data, error } = await supabase
    .from('products')
    .update({
      title: body.name,
      description: body.description,
      price: body.price,
      original_price: body.original_price ?? null,
      category: body.category,
      stock: body.stock,
      image_url: body.image_url ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('seller_id', user.id)
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
