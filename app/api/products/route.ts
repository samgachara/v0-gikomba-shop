import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { handleError, logInfo } from '@/lib/api-error'

// GET /api/products — public product listing with pagination, search, and filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    const filter = searchParams.get('filter') // 'new' | 'sale' | 'bestsellers'
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const page = searchParams.get('page')
    const offset = page
      ? (parseInt(page) - 1) * limit
      : parseInt(searchParams.get('offset') || '0')

    logInfo('Fetching products', { category, featured, search, filter, limit, offset })

    const supabase = await createClient()

    // products.seller_id → sellers (not vendors — matches live schema)
    let query = supabase
      .from('products')
      .select(
        `id, title, name, description, price, original_price, image_url, images,
         category, stock, rating, review_count, num_reviews, is_featured, is_new,
         condition, tags, created_at,
         seller:sellers(id, store_name, verified, logo_url)`,
        { count: 'exact' }
      )
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (featured === 'true' || filter === 'bestsellers') {
      query = query.eq('is_featured', true)
    }

    if (filter === 'new') {
      query = query.eq('is_new', true)
    }

    if (filter === 'sale') {
      query = query.not('original_price', 'is', null)
    }

    if (search) {
      // products have both title and name columns — search both
      query = query.or(
        `title.ilike.%${search}%,name.ilike.%${search}%,description.ilike.%${search}%`
      )
    }

    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      data,
      pagination: {
        total: count,
        limit,
        offset,
        page: page ? parseInt(page) : Math.floor(offset / limit) + 1,
      },
    })
  } catch (error) {
    return handleError(error)
  }
}
