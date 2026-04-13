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
  vendor_id?: string
  created_at: string
  updated_at: string
  vendor?: Vendor
}

export interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  address: string | null
  city: string | null
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

export interface Vendor {
  id: string
  user_id: string
  shop_name: string
  shop_description?: string
  shop_image_url?: string
  bank_account?: string
  bank_name?: string
  mpesa_phone?: string
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  approval_reason?: string
  total_earnings: number
  total_orders: number
  rating: number
  review_count: number
  created_at: string
  updated_at: string
}

export interface SellerEarnings {
  id: string
  vendor_id: string
  order_id?: string
  amount: number
  platform_fee: number
  net_earnings: number
  status: 'pending' | 'verified' | 'payout_pending' | 'paid'
  payout_date?: string
  transaction_id?: string
  created_at: string
  updated_at: string
}

export interface UserProfile extends Profile {
  role?: 'customer' | 'seller' | 'admin'
  vendor_id?: string
}
