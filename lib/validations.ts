import { z } from 'zod'

// Cart validations
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

// Wishlist validations
export const AddToWishlistSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
})

export const DeleteWishlistItemSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
})

// Products validations
export const GetProductsSchema = z.object({
  category: z.string().optional(),
  featured: z.string().optional(),
  search: z.string().optional(),
  limit: z.string().transform(Number).optional(),
  offset: z.string().transform(Number).optional(),
  page: z.string().transform(Number).optional(),
})

// Orders validations
export const CreateOrderSchema = z.object({
  shipping_address: z.string().min(5, 'Address must be at least 5 characters'),
  shipping_city: z.string().min(2, 'City must be at least 2 characters'),
  phone: z.string().regex(/^\+?[0-9\s-()]+$/, 'Invalid phone number'),
  payment_method: z.enum(['mpesa', 'card'], { message: 'Invalid payment method' }),
})

// Payment callback validation
export const MpesaCallbackSchema = z.object({
  Body: z.object({
    stkCallback: z.object({
      MerchantRequestID: z.string(),
      CheckoutRequestID: z.string(),
      ResultCode: z.number(),
      ResultDesc: z.string(),
      CallbackMetadata: z.object({
        Item: z.array(
          z.object({
            Name: z.string(),
            Value: z.any(),
          })
        ).optional(),
      }).optional(),
    }),
  }),
})

export type AddToCart = z.infer<typeof AddToCartSchema>
export type UpdateCartItem = z.infer<typeof UpdateCartItemSchema>
export type DeleteCartItem = z.infer<typeof DeleteCartItemSchema>
export type AddToWishlist = z.infer<typeof AddToWishlistSchema>
export type CreateOrder = z.infer<typeof CreateOrderSchema>
export type MpesaCallback = z.infer<typeof MpesaCallbackSchema>
