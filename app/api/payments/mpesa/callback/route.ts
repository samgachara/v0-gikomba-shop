import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Safaricom M-Pesa STK Push callback handler
 * Safaricom POSTs here after the user completes (or cancels) the STK push
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ResultCode: 1, ResultDesc: 'Invalid JSON' }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    // Safaricom callback structure: Body.stkCallback
    const callback = (body?.Body as Record<string, unknown>)?.stkCallback as Record<string, unknown>
    if (!callback) {
      console.error('[mpesa/callback] Missing stkCallback in body')
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
    }

    const CheckoutRequestID = callback.CheckoutRequestID as string
    const ResultCode = Number(callback.ResultCode)
    const ResultDesc = callback.ResultDesc as string

    if (!CheckoutRequestID) {
      console.error('[mpesa/callback] Missing CheckoutRequestID')
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
    }

    const success = ResultCode === 0

    // Extract MpesaReceiptNumber if payment succeeded
    let mpesaReceiptNumber: string | null = null
    if (success) {
      const items = (callback.CallbackMetadata as Record<string, unknown>)?.Item as Array<Record<string, unknown>>
      if (Array.isArray(items)) {
        const receiptItem = items.find((i) => i.Name === 'MpesaReceiptNumber')
        mpesaReceiptNumber = receiptItem ? String(receiptItem.Value) : null
      }
    }

    // Update mpesa_payments record
    await supabase
      .from('mpesa_payments')
      .update({
        status: success ? 'success' : 'failed',
        result_code: ResultCode,
        result_desc: ResultDesc,
        mpesa_receipt_number: mpesaReceiptNumber,
        raw_callback: body,
        updated_at: new Date().toISOString(),
      })
      .eq('checkout_request_id', CheckoutRequestID)

    // Find the order linked to this checkout request and update payment status
    const { data: order } = await supabase
      .from('orders')
      .select('id')
      .eq('mpesa_transaction_id', CheckoutRequestID)
      .single()

    if (order) {
      await supabase
        .from('orders')
        .update({
          payment_status: success ? 'completed' : 'failed',
          status: success ? 'confirmed' : 'pending',
          updated_at: new Date().toISOString(),
          ...(mpesaReceiptNumber ? { mpesa_transaction_id: mpesaReceiptNumber } : {}),
        })
        .eq('id', order.id)
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  } catch (err) {
    console.error('[mpesa/callback] Error:', err)
    // Always return 200 to Safaricom or they will retry indefinitely
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  }
}
