import { z } from 'zod'
import { AuthError } from '@supabase/supabase-js'

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

// Order schemas
export const orderSchema = z.object({
  shipping_address: z.string().min(5, 'Address is required').max(500),
  shipping_city: z.string().min(2, 'City is required').max(100),
  phone: phoneSchema,
  payment_method: z.enum(['mpesa', 'card'], {
    errorMap: () => ({ message: 'Invalid payment method' }),
  }),
})

export function normalizeAuthError(error: AuthError): string {
  const message = error.message.toLowerCase()
  if (message.includes('invalid login credentials')) {
    return 'Invalid email or password'
  }
  if (message.includes('email not confirmed')) {
    return 'Please verify your email address'
  }
  if (message.includes('too many requests')) {
    return 'Too many attempts. Please try again later'
  }
  return error.message
}

// Type exports
export type LoginInput = z.infer<typeof loginSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type CreateOrderInput = z.infer<typeof orderSchema>
