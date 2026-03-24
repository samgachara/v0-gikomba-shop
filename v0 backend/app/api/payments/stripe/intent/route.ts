import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { fail, ok } from '@/lib/api/response'
import { withApiHandler } from '@/lib/api/handler'

export const POST = withApiHandler(
  async ({ userId }) => {
    const secret = process.env.STRIPE_SECRET_KEY
    if (!secret) return fail('Stripe is not configured', 500)

    const stripe = new Stripe(secret)
    const supabase = await createClient()
    const { data: order, error } = await supabase
      .from('orders')
      .select('id,total,payment_status,user_id')
      .eq('user_id', userId)
      .eq('payment_method', 'card')
      .eq('payment_status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !order) return fail('No pending card order found', 404)

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.total) * 100),
      currency: 'kes',
      metadata: { order_id: order.id, user_id: userId ?? '' },
      automatic_payment_methods: { enabled: true },
    })

    return ok({ clientSecret: intent.client_secret, paymentIntentId: intent.id })
  },
  { requireAuth: true, rateLimit: { maxRequests: 20, windowMs: 60_000 } },
)
