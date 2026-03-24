import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'

export async function updateOrderPaymentStatus(orderId: string, status: 'pending' | 'completed' | 'failed') {
  const supabase = await createClient()
  const { error } = await supabase
    .from('orders')
    .update({ payment_status: status, updated_at: new Date().toISOString() })
    .eq('id', orderId)

  return { error }
}

export function verifyHmacSignature(body: string, signature: string, secret: string) {
  const digest = crypto.createHmac('sha256', secret).update(body).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
}
