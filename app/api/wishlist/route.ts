import {
  successResponse,
  errorResponse,
  validateBody,
  requireAuth,
  withErrorHandler,
  getSupabase,
} from '@/lib/api-utils'
import { wishlistSchema } from '@/lib/validations'

export async function GET() {
  return withErrorHandler(async () => {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const { client: supabase, error: dbError } = await getSupabase()
    if (dbError) return dbError

    const { data, error } = await supabase
      .from('wishlist_items')
      .select(`
        *,
        product:products(*)
      `)
      .eq('user_id', user.id)

    if (error) {
      return errorResponse('Failed to fetch wishlist', 500)
    }

    return successResponse(data)
  })
}

export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const { data: body, error: validationError } = await validateBody(request, wishlistSchema)
    if (validationError) return validationError

    const { client: supabase, error: dbError } = await getSupabase()
    if (dbError) return dbError

    // Check if product exists
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('id', body.product_id)
      .single()

    if (productError || !product) {
      return errorResponse('Product not found', 404)
    }

    // Check if already in wishlist
    const { data: existing } = await supabase
      .from('wishlist_items')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', body.product_id)
      .single()

    if (existing) {
      return successResponse({ message: 'Already in wishlist', alreadyExists: true })
    }

    const { data, error } = await supabase
      .from('wishlist_items')
      .insert({
        user_id: user.id,
        product_id: body.product_id,
      })
      .select(`*, product:products(*)`)
      .single()

    if (error) {
      return errorResponse('Failed to add to wishlist', 500)
    }

    return successResponse(data)
  })
}

export async function DELETE(request: Request) {
  return withErrorHandler(async () => {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const { data: body, error: validationError } = await validateBody(request, wishlistSchema)
    if (validationError) return validationError

    const { client: supabase, error: dbError } = await getSupabase()
    if (dbError) return dbError

    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', body.product_id)

    if (error) {
      return errorResponse('Failed to remove from wishlist', 500)
    }

    return successResponse({ deleted: true })
  })
}
