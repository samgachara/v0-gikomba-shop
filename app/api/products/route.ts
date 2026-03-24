import { createClient } from '@/lib/supabase/server'
import {
  successResponse,
  errorResponse,
  withErrorHandler,
  getPaginationParams,
} from '@/lib/api-utils'
import { sanitizeSearchQuery } from '@/lib/validations'

// Mock products for when Supabase is not configured
const mockProducts = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 4999,
    original_price: 6999,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=500&fit=crop',
    category: 'electronics',
    stock: 25,
    rating: 4.8,
    review_count: 124,
    is_featured: true,
    is_new: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Classic Leather Jacket',
    description: 'Genuine leather jacket with premium finish',
    price: 12999,
    original_price: 15999,
    image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop',
    category: 'men',
    stock: 10,
    rating: 4.6,
    review_count: 89,
    is_featured: true,
    is_new: false,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Elegant Summer Dress',
    description: 'Light and comfortable summer dress',
    price: 3499,
    original_price: 4999,
    image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop',
    category: 'women',
    stock: 15,
    rating: 4.9,
    review_count: 203,
    is_featured: true,
    is_new: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Smart Watch Pro',
    description: 'Advanced smartwatch with health monitoring',
    price: 8999,
    original_price: 11999,
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop',
    category: 'electronics',
    stock: 30,
    rating: 4.7,
    review_count: 156,
    is_featured: true,
    is_new: false,
    created_at: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Designer Handbag',
    description: 'Luxury designer handbag with premium materials',
    price: 7999,
    original_price: 9999,
    image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop',
    category: 'accessories',
    stock: 8,
    rating: 4.5,
    review_count: 67,
    is_featured: true,
    is_new: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Running Sneakers',
    description: 'Comfortable running shoes with advanced cushioning',
    price: 5999,
    original_price: 7499,
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop',
    category: 'men',
    stock: 20,
    rating: 4.8,
    review_count: 312,
    is_featured: true,
    is_new: false,
    created_at: new Date().toISOString(),
  },
  {
    id: '7',
    name: 'Cozy Home Blanket',
    description: 'Soft and warm blanket for your home',
    price: 2499,
    original_price: 3499,
    image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=500&fit=crop',
    category: 'home',
    stock: 50,
    rating: 4.4,
    review_count: 89,
    is_featured: true,
    is_new: false,
    created_at: new Date().toISOString(),
  },
  {
    id: '8',
    name: 'Kids Play Set',
    description: 'Educational play set for children',
    price: 1999,
    original_price: 2499,
    image_url: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=500&fit=crop',
    category: 'kids',
    stock: 35,
    rating: 4.6,
    review_count: 145,
    is_featured: true,
    is_new: true,
    created_at: new Date().toISOString(),
  },
]

export async function GET(request: Request) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    
    const { page, limit, offset } = getPaginationParams(searchParams)

    const supabase = await createClient()

    // If Supabase is not configured, return mock data
    if (!supabase) {
      let filteredProducts = [...mockProducts]

      if (category && category !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === category)
      }

      if (featured === 'true') {
        filteredProducts = filteredProducts.filter(p => p.is_featured)
      }

      if (search) {
        const safeSearch = sanitizeSearchQuery(search).toLowerCase()
        if (safeSearch) {
          filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(safeSearch) ||
            p.description.toLowerCase().includes(safeSearch)
          )
        }
      }

      const total = filteredProducts.length
      const paginatedProducts = filteredProducts.slice(offset, offset + limit)
      const hasMore = offset + limit < total

      return successResponse(paginatedProducts, {
        page,
        limit,
        total,
        hasMore,
      })
    }

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (category && category !== 'all') {
      // Sanitize category input
      const safeCategory = category.replace(/[^a-zA-Z0-9-_]/g, '')
      query = query.eq('category', safeCategory)
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true)
    }

    if (search) {
      // Sanitize search query to prevent injection
      const safeSearch = sanitizeSearchQuery(search)
      if (safeSearch) {
        query = query.or(`name.ilike.%${safeSearch}%,description.ilike.%${safeSearch}%`)
      }
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      return errorResponse('Failed to fetch products', 500)
    }

    const total = count || 0
    const hasMore = offset + limit < total

    return successResponse(data, {
      page,
      limit,
      total,
      hasMore,
    })
  })
}
