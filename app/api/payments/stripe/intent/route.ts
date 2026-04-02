import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { z } from 'zod'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

const schema = z.object({
  order_id: z.string().uuid('Invalid order ID'),
})

function apiError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return apiError('Unauthorized', 401)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid request body', 400)
  }

  const result = schema.safeParse(body)
  if (!result.success) return apiError(result.error.errors[0].message, 400)

  // Fetch the order — verify it belongs to this user and is still pending
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, total, payment_status, payment_method')
    .eq('id', result.data.order_id)
    .eq('buyer_id', user.id)
    .single()

  if (orderError || !order) return apiError('Order not found', 404)
  if (order.payment_method !== 'card') return apiError('Order is not a card payment', 400)
  if (order.payment_status === 'completed') return apiError('Order already paid', 400)

  // Create Stripe PaymentIntent — amount in smallest currency unit (KES cents = fils)
  // KES does not have subunits so amount is in whole KES
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.total * 100), // Stripe uses cents
    currency: 'kes',
    metadata: {
      order_id: order.id,
      buyer_id: user.id,
    },
  })

  // Store the PaymentIntent ID on the order so the webhook can match it
  await supabase
    .from('orders')
    .update({ stripe_payment_intent_id: paymentIntent.id })
    .eq('id', order.id)

  return NextResponse.json({ client_secret: paymentIntent.client_secret })
}
