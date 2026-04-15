import { z } from 'zod'

// ─── Cart ───────────────────────────────────────────────────────────────────
export const AddToCartSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be positive').optional().default(1),
})

export const UpdateCartItemSchema = z.object({
  id: z.string().uuid('Invalid cart item ID'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
})

export const DeleteCartItemSchema = z.object({
  id: z.string().uuid('Invalid cart item ID'),
})

// ─── Wishlist ────────────────────────────────────────────────────────────────
export const AddToWishlistSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
})

export const DeleteWishlistItemSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
})

// ─── Products ────────────────────────────────────────────────────────────────
export const GetProductsSchema = z.object({
  category: z.string().optional(),
  featured: z.string().optional(),
  search: z.string().optional(),
  filter: z.enum(['new', 'sale', 'bestsellers']).optional(),
  limit: z.string().transform(Number).optional(),
  offset: z.string().transform(Number).optional(),
  page: z.string().transform(Number).optional(),
})

// ─── Orders ──────────────────────────────────────────────────────────────────
// Matches your live `orders` table:
//   buyer_id, product_id, status, total, payment_status, payment_method,
//   mpesa_transaction_id, shipping_address, shipping_city, phone
export const CreateOrderSchema = z.object({
  shipping_address: z.string().min(5, 'Address must be at least 5 characters'),
  shipping_city: z.string().min(2, 'City must be at least 2 characters'),
  phone: z.string().regex(/^\+?[0-9\s\-()+]+$/, 'Invalid phone number'),
  payment_method: z.enum(['mpesa', 'card', 'cash'], {
    message: 'Invalid payment method',
  }),
})

// ─── M-Pesa ──────────────────────────────────────────────────────────────────
export const MpesaCallbackSchema = z.object({
  Body: z.object({
    stkCallback: z.object({
      MerchantRequestID: z.string(),
      CheckoutRequestID: z.string(),
      ResultCode: z.number(),
      ResultDesc: z.string(),
      CallbackMetadata: z
        .object({
          Item: z
            .array(z.object({ Name: z.string(), Value: z.any() }))
            .optional(),
        })
        .optional(),
    }),
  }),
})

// ─── Sellers ─────────────────────────────────────────────────────────────────
// Matches `sellers` table: store_name, description, phone, location, logo_url
// and `profiles` columns: shop_name, shop_description, location, avatar_url
export const RegisterSellerSchema = z.object({
  store_name: z
    .string()
    .min(3, 'Store name must be at least 3 characters')
    .max(100),
  description: z.string().max(500).optional(),
  phone: z
    .string()
    .regex(/^254\d{9}$/, 'Phone must be in format 254xxxxxxxxx')
    .optional(),
  location: z.string().max(200).optional(),
  logo_url: z.string().url('Invalid logo URL').optional(),
})

export const UpdateSellerSchema = z.object({
  store_name: z.string().min(3).max(100).optional(),
  description: z.string().max(500).optional(),
  phone: z
    .string()
    .regex(/^254\d{9}$/, 'Invalid M-Pesa phone number')
    .optional(),
  location: z.string().max(200).optional(),
  logo_url: z.string().url().optional(),
})

export const ApproveSelllerSchema = z.object({
  seller_id: z.string().uuid('Invalid seller ID'),
  status: z.enum(['approved', 'rejected', 'suspended']),
})

// ─── Seller Products ─────────────────────────────────────────────────────────
// Matches `products` table (seller_id, title, description, price, image_url,
//   category, stock, is_active, is_featured, condition, images, tags, original_price)
export const CreateSellerProductSchema = z.object({
  title: z.string().min(3, 'Product name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').optional(),
  price: z.number().positive('Price must be positive'),
  original_price: z.number().positive().optional(),
  image_url: z.string().url('Invalid image URL').optional(),
  images: z.array(z.string().url()).optional(),
  category: z.string().min(2, 'Category is required'),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
  condition: z.enum(['new', 'used', 'like_new', 'good', 'fair']).optional().default('used'),
  tags: z.array(z.string()).optional(),
  is_featured: z.boolean().optional().default(false),
})

export const UpdateSellerProductSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  price: z.number().positive().optional(),
  original_price: z.number().positive().optional(),
  image_url: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  category: z.string().optional(),
  stock: z.number().int().nonnegative().optional(),
  condition: z.enum(['new', 'used', 'like_new', 'good', 'fair']).optional(),
  tags: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
  is_featured: z.boolean().optional(),
})

// ─── Types ───────────────────────────────────────────────────────────────────
export type AddToCart = z.infer<typeof AddToCartSchema>
export type UpdateCartItem = z.infer<typeof UpdateCartItemSchema>
export type DeleteCartItem = z.infer<typeof DeleteCartItemSchema>
export type AddToWishlist = z.infer<typeof AddToWishlistSchema>
export type CreateOrder = z.infer<typeof CreateOrderSchema>
export type MpesaCallback = z.infer<typeof MpesaCallbackSchema>
export type RegisterSeller = z.infer<typeof RegisterSellerSchema>
export type UpdateSeller = z.infer<typeof UpdateSellerSchema>
export type CreateSellerProduct = z.infer<typeof CreateSellerProductSchema>
export type UpdateSellerProduct = z.infer<typeof UpdateSellerProductSchema>
