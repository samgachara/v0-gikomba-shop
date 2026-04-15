import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { CreateOrderSchema } from '@/lib/validations'
import { handleError, logInfo } from '@/lib/api-error'

// GET /api/orders — fetch the authenticated buyer's orders
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    logInfo('Fetching orders', { buyer_id: user.id })

    // orders.buyer_id references auth.users — matches live schema
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          product:products(*)
        )
      `)
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    return handleError(error)
  }
}

// POST /api/orders — create order from cart, then clear cart
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { shipping_address, shipping_city, phone, payment_method } =
      CreateOrderSchema.parse(body)

    logInfo('Creating order', { buyer_id: user.id, payment_method })

    // Fetch cart with products
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select('*, product:products(id, price, stock, is_active, seller_id, title)')
      .eq('user_id', user.id)

    if (cartError) throw cartError
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // Validate stock for each item
    for (const item of cartItems) {
      if (!item.product?.is_active) {
        return NextResponse.json(
          { error: `Product "${item.product?.title}" is no longer available` },
          { status: 400 }
        )
      }
      if (item.product.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for "${item.product.title}"`,
            available: item.product.stock,
          },
          { status: 400 }
        )
      }
    }

    const total = cartItems.reduce(
      (sum, item) => sum + (item.product?.price || 0) * item.quantity,
      0
    )

    // Create order — buyer_id matches live schema
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: user.id,
        total,
        shipping_address,
        shipping_city,
        phone,
        payment_method,
        status: 'pending',
        payment_status: 'pending',
      })
      .select()
      .single()

    if (orderError) throw orderError

    logInfo('Order created', { order_id: order.id, total })

    // Create order items
    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.product?.price || 0,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    // Decrement stock for each product
    for (const item of cartItems) {
      await supabase
        .from('products')
        .update({ stock: item.product.stock - item.quantity })
        .eq('id', item.product_id)
    }

    // Clear cart
    await supabase.from('cart_items').delete().eq('user_id', user.id)

    // Return complete order
    const { data: completeOrder } = await supabase
      .from('orders')
      .select('*, items:order_items(*, product:products(*))')
      .eq('id', order.id)
      .single()

    return NextResponse.json(completeOrder, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}
