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

  const query = supabase.from('products').delete().eq('id', id)
  // Admins can delete any product; sellers only their own
  if (!isAdmin) query.eq('seller_id', user.id)

  const { error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
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
