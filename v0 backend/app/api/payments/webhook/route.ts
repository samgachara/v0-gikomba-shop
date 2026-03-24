import Stripe from 'stripe'
import { NextRequest } from 'next/server'
import { fail, ok } from '@/lib/api/response'
import { updateOrderPaymentStatus, verifyHmacSignature } from '@/lib/services/payment-service'

export async function POST(request: NextRequest) {
  const provider = request.headers.get('x-payment-provider')
  const rawBody = await request.text()

  if (provider === 'stripe') {
    const secret = process.env.STRIPE_SECRET_KEY
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    const signature = request.headers.get('stripe-signature')
    if (!secret || !webhookSecret || !signature) return fail('Invalid webhook configuration', 500)

    const stripe = new Stripe(secret)
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
    } catch {
      return fail('Invalid Stripe signature', 400)
    }

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as Stripe.PaymentIntent
      const orderId = intent.metadata.order_id
      if (orderId) await updateOrderPaymentStatus(orderId, 'completed')
    }
    if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object as Stripe.PaymentIntent
      const orderId = intent.metadata.order_id
      if (orderId) await updateOrderPaymentStatus(orderId, 'failed')
    }
    return ok({ received: true })
  }

  if (provider === 'mpesa') {
    const signature = request.headers.get('x-mpesa-signature') ?? ''
    const secret = process.env.MPESA_WEBHOOK_SECRET
    if (!secret || !verifyHmacSignature(rawBody, signature, secret)) {
      return fail('Invalid M-Pesa signature', 400)
    }

    const payload = JSON.parse(rawBody) as {
      Body?: { stkCallback?: { ResultCode?: number; CheckoutRequestID?: string } }
      order_id?: string
    }
    const orderId = payload.order_id
    const success = payload.Body?.stkCallback?.ResultCode === 0
    if (orderId) await updateOrderPaymentStatus(orderId, success ? 'completed' : 'failed')

    return ok({ received: true })
  }

  return fail('Unknown payment provider', 400)
}
