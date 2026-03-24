import { z } from 'zod'

export const productsQuerySchema = z.object({
  category: z.string().optional(),
  featured: z.enum(['true', 'false']).optional(),
  search: z.string().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

export const cartPostSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().min(1).max(99).default(1),
})

export const cartPutSchema = z.object({
  id: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
})

export const cartDeleteSchema = z.object({
  id: z.string().uuid(),
})

export const wishlistSchema = z.object({
  product_id: z.string().uuid(),
})

export const orderCreateSchema = z.object({
  shipping_address: z.string().min(6).max(200),
  shipping_city: z.string().min(2).max(80),
  phone: z.string().min(10).max(20),
  payment_method: z.enum(['mpesa', 'card']),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const strongPasswordSchema = z
  .string()
  .min(10, 'Password must be at least 10 characters')
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/[a-z]/, 'Password must include a lowercase letter')
  .regex(/\d/, 'Password must include a number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must include a special character')
