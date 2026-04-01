export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  original_price: number | null
  image_url: string | null
  category: string
  stock: number
  rating: number
  review_count: number
  is_featured: boolean
  is_new: boolean
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
  role: 'buyer' | 'seller'
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  created_at: string
  updated_at: string
  product?: Product
}

export interface WishlistItem {
  id: string
  user_id: string
  product_id: string
  created_at: string
  product?: Product
}

export interface Order {
  id: string
  user_id: string
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  shipping_address: string
  shipping_city: string
  phone: string
  payment_method: 'mpesa' | 'card'
  payment_status: 'pending' | 'completed' | 'failed'
  mpesa_transaction_id: string | null
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  created_at: string
  product?: Product
}
