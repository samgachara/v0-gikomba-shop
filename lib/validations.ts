import { z } from 'zod'

// Password validation - strong password rules
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

// Email validation
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(1, 'Email is required')

// Phone validation (Kenya format)
export const phoneSchema = z
  .string()
  .min(10, 'Phone number must be at least 10 digits')
  .regex(/^(\+254|254|0)?[71]\d{8}$/, 'Invalid Kenyan phone number')

// Cart schemas
export const addToCartSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().min(1).max(100).default(1),
})

export const updateCartSchema = z.object({
  id: z.string().uuid('Invalid cart item ID'),
  quantity: z.number().int().min(1).max(100),
})

export const removeFromCartSchema = z.object({
  id: z.string().uuid('Invalid cart item ID'),
})

// Wishlist schemas
export const wishlistSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
})

// Order schemas
export const orderSchema = z.object({
  shipping_address: z.string().min(5, 'Address is required').max(500),
  shipping_city: z.string().min(2, 'City is required').max(100),
  phone: phoneSchema,
  payment_method: z.enum(['mpesa', 'card'], {
    errorMap: () => ({ message: 'Invalid payment method' }),
  }),
})

// Product query schemas
export const productQuerySchema = z.object({
  category: z.string().optional(),
  featured: z.enum(['true', 'false']).optional(),
  search: z.string().max(100).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  page: z.string().regex(/^\d+$/).optional(),
})

// Auth schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  phone: phoneSchema,
})

// Sanitize search query to prevent injection
export function sanitizeSearchQuery(query: string): string {
  return query
    .replace(/[%_\\]/g, '\\$&') // Escape SQL wildcards
    .replace(/[<>";]/g, '') // Remove potential XSS/SQL injection chars
    .trim()
    .slice(0, 100) // Limit length
}

// Type exports
export type AddToCartInput = z.infer<typeof addToCartSchema>
export type UpdateCartInput = z.infer<typeof updateCartSchema>
export type RemoveFromCartInput = z.infer<typeof removeFromCartSchema>
export type WishlistInput = z.infer<typeof wishlistSchema>
export type CreateOrderInput = z.infer<typeof orderSchema>
export type ProductQueryInput = z.infer<typeof productQuerySchema>
export type LoginInput = z.infer<typeof loginSchema>
export type SignUpInput = z.infer<typeof signUpSchema>

// ─── Seller schemas ───────────────────────────────────────────────────────────

export const RegisterSellerSchema = z.object({
  store_name:  z.string().min(2, 'Store name must be at least 2 characters').max(100),
  description: z.string().max(1000).optional(),
  location:    z.string().max(200).optional(),
  phone:       phoneSchema.optional(),
  logo_url:    z.string().url('Invalid logo URL').optional().or(z.literal('')),
})

export const UpdateSellerSchema = RegisterSellerSchema.partial()

// Admin: approve / reject / verify a seller
export const ApproveSelllerSchema = z.object({
  seller_id: z.string().uuid('Invalid seller ID'),
  status:    z.enum(['active', 'suspended', 'pending']),
  verified:  z.boolean().optional(),
})

// ─── M-Pesa STK Push callback (Safaricom format) ─────────────────────────────

export const MpesaCallbackSchema = z.object({
  Body: z.object({
    stkCallback: z.object({
      MerchantRequestID: z.string(),
      CheckoutRequestID: z.string(),
      ResultCode:        z.number(),
      ResultDesc:        z.string(),
      CallbackMetadata:  z.object({
        Item: z.array(
          z.object({
            Name:  z.string(),
            Value: z.union([z.string(), z.number()]).optional(),
          })
        ),
      }).optional(),
    }),
  }),
})

export type RegisterSellerInput = z.infer<typeof RegisterSellerSchema>
export type UpdateSellerInput   = z.infer<typeof UpdateSellerSchema>
export type ApproveSelllerInput = z.infer<typeof ApproveSelllerSchema>
export type MpesaCallbackInput  = z.infer<typeof MpesaCallbackSchema>
