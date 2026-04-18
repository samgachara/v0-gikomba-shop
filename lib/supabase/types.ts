// Supabase row types used across API routes

export interface Order {
  id: string
  buyer_id: string
  seller_id: string | null
  product_id: string | null
  quantity: number
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
  payment_method: 'mpesa' | 'card' | 'cash'
  mpesa_transaction_id: string | null
  stripe_payment_intent_id: string | null
  shipping_address: string | null
  shipping_city: string | null
  phone: string | null
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  created_at: string
  product?: {
    id: string
    title: string
    name: string
    image_url: string | null
    price: number
  }
}

export interface Product {
  id: string
  seller_id: string | null
  title: string
  name: string
  description: string | null
  price: number
  original_price: number | null
  image_url: string | null
  category: string
  stock: number
  is_active: boolean
  is_featured: boolean
  is_new: boolean
  num_reviews: number
  review_count: number
  rating: number
  condition: string
  images: string[]
  tags: string[]
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  address: string | null
  city: string | null
  role: 'buyer' | 'seller' | 'admin'
  avatar_url: string | null
  is_active: boolean
  shop_name: string | null
  shop_description: string | null
  location: string | null
  created_at: string
  updated_at: string
}
