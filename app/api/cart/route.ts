import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import {
  AddToCartSchema,
  UpdateCartItemSchema,
  DeleteCartItemSchema,
} from '@/lib/validations'
import { handleError, logInfo } from '@/lib/api-error'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    logInfo('Fetching cart items', { user_id: user.id })

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(*)
      `)
      .eq('user_id', user.id)

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { product_id, quantity } = AddToCartSchema.parse(body)

    logInfo('Adding to cart', { user_id: user.id, product_id, quantity })

    // Verify product exists and has stock
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, stock, price')
      .eq('id', product_id)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock', available: product.stock },
        { status: 400 }
      )
    }

    // Check if item already exists in cart
    const { data: existing } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', product_id)
      .single()

    if (existing) {
      // Update quantity
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id)
        .eq('user_id', user.id)
        .select(`*, product:products(*)`)
        .single()

      if (error) {
        throw error
      }

      return NextResponse.json(data)
    }

    // Create new cart item
    const { data, error } = await supabase
      .from('cart_items')
      .insert({
        user_id: user.id,
        product_id,
        quantity,
      })
      .select(`*, product:products(*)`)
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, quantity } = UpdateCartItemSchema.parse(body)

    logInfo('Updating cart item', { user_id: user.id, item_id: id, quantity })

    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`*, product:products(*)`)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return handleError(error)
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id } = DeleteCartItemSchema.parse(body)

    logInfo('Removing from cart', { user_id: user.id, item_id: id })

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleError(error)
  }
}
