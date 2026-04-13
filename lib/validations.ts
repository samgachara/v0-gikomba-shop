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

// Vendor validations
export const CreateVendorSchema = z.object({
  shop_name: z.string().min(3, 'Shop name must be at least 3 characters').max(100),
  shop_description: z.string().max(500).optional(),
  shop_image_url: z.string().url().optional(),
  bank_account: z.string().optional(),
  bank_name: z.string().optional(),
  mpesa_phone: z.string().regex(/^254\d{9}$/, 'Invalid M-Pesa phone number (254xxxxxxxxx)').optional(),
})

export const UpdateVendorSchema = z.object({
  shop_name: z.string().min(3).max(100).optional(),
  shop_description: z.string().max(500).optional(),
  shop_image_url: z.string().url().optional(),
  bank_account: z.string().optional(),
  bank_name: z.string().optional(),
  mpesa_phone: z.string().regex(/^254\d{9}$/, 'Invalid M-Pesa phone number').optional(),
})

export const ApproveVendorSchema = z.object({
  vendor_id: z.string().uuid('Invalid vendor ID'),
  status: z.enum(['approved', 'rejected']),
  approval_reason: z.string().optional(),
})

export const UpdateSellerProductSchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  original_price: z.number().positive().optional(),
  image_url: z.string().url().optional(),
  category: z.string().optional(),
  stock: z.number().nonnegative().optional(),
  is_featured: z.boolean().optional(),
  is_new: z.boolean().optional(),
})

export const CreateProductSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be positive'),
  original_price: z.number().positive().optional(),
  image_url: z.string().url('Invalid image URL').optional(),
  category: z.string().min(2, 'Category is required'),
  stock: z.number().nonnegative('Stock cannot be negative'),
})

export type AddToCart = z.infer<typeof AddToCartSchema>
export type UpdateCartItem = z.infer<typeof UpdateCartItemSchema>
export type DeleteCartItem = z.infer<typeof DeleteCartItemSchema>
export type AddToWishlist = z.infer<typeof AddToWishlistSchema>
export type CreateOrder = z.infer<typeof CreateOrderSchema>
export type MpesaCallback = z.infer<typeof MpesaCallbackSchema>
export type CreateVendor = z.infer<typeof CreateVendorSchema>
export type UpdateVendor = z.infer<typeof UpdateVendorSchema>
export type ApproveVendor = z.infer<typeof ApproveVendorSchema>
export type CreateProduct = z.infer<typeof CreateProductSchema>
