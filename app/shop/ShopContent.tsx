// lib/types.ts
// Single source of truth for all shared types across the app.
// Vendor has been removed — use Seller everywhere.

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface Product {
  id: string
  name: string
  title?: string | null        // alias used in some DB rows — prefer name
  description: string | null
  price: number
  original_price?: number | null
  image_url: string | null
  category: string
  stock: number
  quality_grade?: 'A' | 'B' | 'C' | null
  rating?: number
  review_count?: number
  num_reviews?: number
  is_featured?: boolean
  is_new?: boolean
  is_active?: boolean
  seller_id?: string | null
  tags?: string[] | null
  condition?: string | null
  created_at: string
  updated_at?: string
}

export interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  address: string | null
  city: string | null
  role: 'buyer' | 'seller' | 'admin'
  created_at: string
  updated_at: string
}

// ── Seller ────────────────────────────────────────────────────────────────
// Matches the `sellers` table. Use this everywhere — Vendor is gone.
export interface Seller {
  id: string
  user_id?: string | null
  store_name: string
  store_description: string | null
  phone?: string | null          // used for WhatsApp routing
  verified: boolean
  status: 'active' | 'inactive' | 'suspended'
  commission_rate?: number | null
  total_sales?: number | null
  rating?: number | null
  num_reviews?: number | null
  created_at: string
  updated_at?: string
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

export interface SellerEarnings {
  id: string
  seller_id: string
  amount: number
  net_amount: number
  commission_amount: number
  status: string
  mpesa_phone: string | null
  mpesa_receipt: string | null
  period_start: string | null
  period_end: string | null
  created_at: string
}

// ── M-Pesa phone utility ──────────────────────────────────────────────────
// Safaricom STK push requires the number in 254XXXXXXXXX format (12 digits).
// This function accepts any common Kenyan format and normalises it.
// Returns null if the number cannot be normalised — always validate before use.
//
// Accepted input formats:
//   0712345678   → 254712345678
//   +254712345678 → 254712345678
//   254712345678 → 254712345678  (already correct)
//   712345678    → 254712345678  (9-digit local)
//
// Usage:
//   const phone = normaliseMpesaPhone(userInput)
//   if (!phone) return { error: 'Invalid phone number' }
//   // use phone in STK push request

export function normaliseMpesaPhone(raw: string): string | null {
  if (!raw) return null

  // Strip all whitespace, dashes, parentheses
  const cleaned = raw.replace(/[\s\-()]/g, '')

  // +254XXXXXXXXX → 254XXXXXXXXX
  if (/^\+254\d{9}$/.test(cleaned)) {
    return cleaned.slice(1)
  }

  // 254XXXXXXXXX — already correct format
  if (/^254\d{9}$/.test(cleaned)) {
    return cleaned
  }

  // 07XXXXXXXX or 01XXXXXXXX (10-digit starting with 0)
  if (/^0[17]\d{8}$/.test(cleaned)) {
    return '254' + cleaned.slice(1)
  }

  // 7XXXXXXXX or 1XXXXXXXX (9-digit, no leading 0)
  if (/^[17]\d{8}$/.test(cleaned)) {
    return '254' + cleaned
  }

  return null // unrecognised format
}

// Helper — returns a user-friendly error message for invalid phone input
export function validateMpesaPhone(raw: string): { valid: true; phone: string } | { valid: false; error: string } {
  const phone = normaliseMpesaPhone(raw)
  if (!phone) {
    return {
      valid: false,
      error: 'Enter a valid Safaricom number (e.g. 0712 345 678)',
    }
  }
  return { valid: true, phone }
}

// ── @deprecated Vendor ────────────────────────────────────────────────────
// Kept only to avoid breaking any old import — remove once all references
// have been updated to use Seller.
/** @deprecated Use Seller instead */
export type Vendor = Seller
