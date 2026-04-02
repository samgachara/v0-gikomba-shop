import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { initiateStkPush } from '@/lib/services/mpesa'

const schema = z.object({
  order_id: z.string().uuid('Invalid order ID'),
  phone: z.string().regex(/^\+?[0-9\s\-().]{7,20}$/, 'Invalid phone number'),
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

  // Verify the order belongs to this user and is still pending
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, total, payment_status, payment_method')
    .eq('id', result.data.order_id)
    .eq('buyer_id', user.id)
    .single()

  if (orderError || !order) return apiError('Order not found', 404)
  if (order.payment_method !== 'mpesa') return apiError('Order is not an M-Pesa payment', 400)
  if (order.payment_status === 'completed') return apiError('Order already paid', 400)

  try {
    const stkResult = await initiateStkPush({
      phone: result.data.phone,
      amount: order.total,
      orderId: order.id,
      description: 'gikomba.shop payment',
    })

    // Store CheckoutRequestID so the webhook can match the callback
    await supabase
      .from('orders')
      .update({ mpesa_transaction_id: stkResult.CheckoutRequestID })
      .eq('id', order.id)

    return NextResponse.json({
      checkout_request_id: stkResult.CheckoutRequestID,
      message: stkResult.CustomerMessage,
    })
  } catch (err) {
    console.error('[mpesa/initiate]', err)
    return apiError('Failed to initiate M-Pesa payment. Please try again.', 500)
  }
}
