import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, withErrorHandler } from '@/lib/api-utils'

// Mock product lookup for when Supabase is not configured
const mockProducts: Record<string, object> = {
  '1': {
    id: '1',
    name: 'Premium Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation. Experience immersive sound with deep bass and crystal clear highs. Comfortable over-ear design with memory foam cushions for extended listening sessions.',
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
  '2': {
    id: '2',
    name: 'Classic Leather Jacket',
    description: 'Genuine leather jacket with premium finish. Crafted from 100% genuine leather with a soft inner lining. Features multiple pockets and a timeless design.',
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
  '3': {
    id: '3',
    name: 'Elegant Summer Dress',
    description: 'Light and comfortable summer dress perfect for warm weather. Made from breathable cotton blend fabric with a flattering A-line silhouette.',
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
  '4': {
    id: '4',
    name: 'Smart Watch Pro',
    description: 'Advanced smartwatch with health monitoring features. Track your fitness, heart rate, sleep patterns, and receive notifications directly on your wrist.',
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
  '5': {
    id: '5',
    name: 'Designer Handbag',
    description: 'Luxury designer handbag with premium materials. Spacious interior with multiple compartments for organization. Gold-tone hardware accents.',
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
  '6': {
    id: '6',
    name: 'Running Sneakers',
    description: 'Comfortable running shoes with advanced cushioning technology. Lightweight mesh upper for breathability. Perfect for daily runs and workouts.',
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
  '7': {
    id: '7',
    name: 'Cozy Home Blanket',
    description: 'Soft and warm blanket for your home. Made from ultra-soft fleece material. Perfect for cozy nights on the couch.',
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
  '8': {
    id: '8',
    name: 'Kids Play Set',
    description: 'Educational play set for children ages 3-8. Includes building blocks, puzzles, and creative toys. Promotes learning through play.',
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
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const { id } = await params
    const supabase = await createClient()
    
    // If Supabase is not configured, return mock data
    if (!supabase) {
      const product = mockProducts[id]
      if (!product) {
        return errorResponse('Product not found', 404)
      }
      return successResponse(product)
    }
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return errorResponse('Product not found', 404)
    }

    return successResponse(data)
  })
}
