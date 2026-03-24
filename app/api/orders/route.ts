import {
  successResponse,
  errorResponse,
  validateBody,
  requireAuth,
  withErrorHandler,
  getPaginationParams,
  getSupabase,
} from '@/lib/api-utils'
import { createOrderSchema } from '@/lib/validations'

export async function GET(request: Request) {
  return withErrorHandler(async () => {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const { searchParams } = new URL(request.url)
    const { page, limit, offset } = getPaginationParams(searchParams)

    const { client: supabase, error: dbError } = await getSupabase()
    if (dbError) return dbError

    const { data, error, count } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          product:products(*)
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return errorResponse('Failed to fetch orders', 500)
    }

    const total = count || 0

    return successResponse(data, {
      page,
      limit,
      total,
      hasMore: offset + limit < total,
    })
  })
}

export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const { data: body, error: validationError } = await validateBody(request, createOrderSchema)
    if (validationError) return validationError

    const { client: supabase, error: dbError } = await getSupabase()
    if (dbError) return dbError

    // Get cart items with product details
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(id, name, price, stock)
      `)
      .eq('user_id', user.id)

    if (cartError) {
      return errorResponse('Failed to fetch cart', 500)
    }

    if (!cartItems || cartItems.length === 0) {
      return errorResponse('Cart is empty', 400)
    }

    // Validate stock for all items BEFORE creating order
    const stockIssues: string[] = []
    for (const item of cartItems) {
      if (!item.product) {
        stockIssues.push(`Product no longer available`)
        continue
      }
      if (item.product.stock < item.quantity) {
        stockIssues.push(
          `${item.product.name}: only ${item.product.stock} available (requested ${item.quantity})`
        )
      }
    }

    if (stockIssues.length > 0) {
      return errorResponse(`Stock issues: ${stockIssues.join('; ')}`, 400)
    }

    // Calculate total
    const total = cartItems.reduce((sum, item) => {
      return sum + (item.product?.price || 0) * item.quantity
    }, 0)

    // Create order (atomic operation would require database function)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total,
        shipping_address: body.shipping_address,
        shipping_city: body.shipping_city,
        phone: body.phone,
        payment_method: body.payment_method,
        status: 'pending',
        payment_status: 'pending',
      })
      .select()
      .single()

    if (orderError) {
      return errorResponse('Failed to create order', 500)
    }

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

    if (itemsError) {
      // Rollback order if items fail
      await supabase.from('orders').delete().eq('id', order.id)
      return errorResponse('Failed to create order items', 500)
    }

    // Deduct stock for each product
    for (const item of cartItems) {
      if (item.product) {
        const { error: stockError } = await supabase
          .from('products')
          .update({ 
            stock: item.product.stock - item.quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.product.id)

        if (stockError) {
          console.error('Failed to update stock for product:', item.product.id)
        }
      }
    }

    // Clear cart
    const { error: clearError } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)

    if (clearError) {
      console.error('Failed to clear cart:', clearError)
    }

    // Fetch complete order with items
    const { data: completeOrder, error: fetchError } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          product:products(*)
        )
      `)
      .eq('id', order.id)
      .single()

    if (fetchError) {
      return errorResponse('Order created but failed to fetch details', 500)
    }

    return successResponse(completeOrder)
  })
}
