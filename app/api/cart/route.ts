import {
  successResponse,
  errorResponse,
  validateBody,
  requireAuth,
  withErrorHandler,
  getSupabase,
} from '@/lib/api-utils'
import {
  addToCartSchema,
  updateCartSchema,
  removeFromCartSchema,
} from '@/lib/validations'

export async function GET() {
  return withErrorHandler(async () => {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const { client: supabase, error: dbError } = await getSupabase()
    if (dbError) return dbError

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(*)
      `)
      .eq('user_id', user.id)

    if (error) {
      return errorResponse('Failed to fetch cart', 500)
    }

    return successResponse(data)
  })
}

export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const { data: body, error: validationError } = await validateBody(request, addToCartSchema)
    if (validationError) return validationError

    const { client: supabase, error: dbError } = await getSupabase()
    if (dbError) return dbError

    // Check if product exists and has sufficient stock
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, stock, name')
      .eq('id', body.product_id)
      .single()

    if (productError || !product) {
      return errorResponse('Product not found', 404)
    }

    if (product.stock < body.quantity) {
      return errorResponse(`Insufficient stock. Only ${product.stock} available`, 400)
    }

    // Use upsert to prevent race conditions
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('product_id', body.product_id)
      .single()

    if (existing) {
      const newQuantity = existing.quantity + body.quantity
      
      // Validate total quantity against stock
      if (newQuantity > product.stock) {
        return errorResponse(`Cannot add more. Only ${product.stock} available (${existing.quantity} already in cart)`, 400)
      }

      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select(`*, product:products(*)`)
        .single()

      if (error) {
        return errorResponse('Failed to update cart', 500)
      }

      return successResponse(data)
    }

    // Create new cart item
    const { data, error } = await supabase
      .from('cart_items')
      .insert({
        user_id: user.id,
        product_id: body.product_id,
        quantity: body.quantity,
      })
      .select(`*, product:products(*)`)
      .single()

    if (error) {
      return errorResponse('Failed to add to cart', 500)
    }

    return successResponse(data)
  })
}

export async function PUT(request: Request) {
  return withErrorHandler(async () => {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const { data: body, error: validationError } = await validateBody(request, updateCartSchema)
    if (validationError) return validationError

    const { client: supabase, error: dbError } = await getSupabase()
    if (dbError) return dbError

    // Get cart item with product to validate stock
    const { data: cartItem } = await supabase
      .from('cart_items')
      .select('*, product:products(stock)')
      .eq('id', body.id)
      .eq('user_id', user.id)
      .single()

    if (!cartItem) {
      return errorResponse('Cart item not found', 404)
    }

    if (cartItem.product && body.quantity > cartItem.product.stock) {
      return errorResponse(`Insufficient stock. Only ${cartItem.product.stock} available`, 400)
    }

    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity: body.quantity, updated_at: new Date().toISOString() })
      .eq('id', body.id)
      .eq('user_id', user.id)
      .select(`*, product:products(*)`)
      .single()

    if (error) {
      return errorResponse('Failed to update cart', 500)
    }

    return successResponse(data)
  })
}

export async function DELETE(request: Request) {
  return withErrorHandler(async () => {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const { data: body, error: validationError } = await validateBody(request, removeFromCartSchema)
    if (validationError) return validationError

    const { client: supabase, error: dbError } = await getSupabase()
    if (dbError) return dbError

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', body.id)
      .eq('user_id', user.id)

    if (error) {
      return errorResponse('Failed to remove from cart', 500)
    }

    return successResponse({ deleted: true })
  })
}
