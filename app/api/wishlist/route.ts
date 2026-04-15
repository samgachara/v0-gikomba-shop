import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { AddToWishlistSchema, DeleteWishlistItemSchema } from '@/lib/validations'
import { handleError, logInfo } from '@/lib/api-error'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    logInfo('Fetching wishlist', { user_id: user.id })

    const { data, error } = await supabase
      .from('wishlist_items')
      .select('*, product:products(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { product_id } = AddToWishlistSchema.parse(body)

    logInfo('Adding to wishlist', { user_id: user.id, product_id })

    // Confirm product exists
    const { data: product } = await supabase
      .from('products')
      .select('id')
      .eq('id', product_id)
      .single()

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check for duplicate
    const { data: existing } = await supabase
      .from('wishlist_items')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', product_id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Product already in wishlist' }, { status: 409 })
    }

    const { data, error } = await supabase
      .from('wishlist_items')
      .insert({ user_id: user.id, product_id })
      .select('*, product:products(*)')
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { product_id } = DeleteWishlistItemSchema.parse(body)

    logInfo('Removing from wishlist', { user_id: user.id, product_id })

    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', product_id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleError(error)
  }
}
