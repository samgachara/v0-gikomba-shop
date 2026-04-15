import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { MpesaCallbackSchema } from '@/lib/validations'
import { handleError, logInfo } from '@/lib/api-error'

// POST /api/payments/mpesa-callback
// Called by Safaricom STK Push after payment attempt.
// Matches live `mpesa_payments` table columns.
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = MpesaCallbackSchema.parse(body)

    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } =
      parsed.Body.stkCallback

    logInfo('M-Pesa callback received', { CheckoutRequestID, ResultCode })

    const supabase = await createClient()

    // Extract metadata items sent back by Safaricom
    const items = CallbackMetadata?.Item || []
    const getItem = (name: string) =>
      items.find(i => i.Name === name)?.Value ?? null

    const mpesaReceiptNumber = getItem('MpesaReceiptNumber')
    const amount = getItem('Amount')
    const phone = getItem('PhoneNumber')

    const isSuccess = ResultCode === 0

    // Update the matching mpesa_payments row (keyed by CheckoutRequestID)
    const { data: payment, error: paymentError } = await supabase
      .from('mpesa_payments')
      .update({
        status: isSuccess ? 'success' : 'failed',
        mpesa_receipt_number: mpesaReceiptNumber,
        result_code: ResultCode,
        result_desc: ResultDesc,
        raw_callback: body,
        updated_at: new Date().toISOString(),
      })
      .eq('checkout_request_id', CheckoutRequestID)
      .select()
      .single()

    if (paymentError) {
      logInfo('M-Pesa payment record not found', { CheckoutRequestID })
      // Still return 200 so Safaricom doesn't retry
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
    }

    logInfo('M-Pesa payment updated', {
      id: payment.id,
      status: isSuccess ? 'success' : 'failed',
      receipt: mpesaReceiptNumber,
    })

    // If successful, update the linked order payment_status
    if (isSuccess && payment.order_id) {
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          payment_status: 'completed',
          status: 'confirmed',
          mpesa_transaction_id: mpesaReceiptNumber,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.order_id)

      if (orderError) {
        logInfo('Failed to update order after payment', {
          order_id: payment.order_id,
          error: orderError.message,
        })
      } else {
        logInfo('Order confirmed after M-Pesa payment', {
          order_id: payment.order_id,
          receipt: mpesaReceiptNumber,
        })
      }
    }

    // Safaricom expects this exact shape with ResultCode 0
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  } catch (error) {
    logInfo('M-Pesa callback error', { error })
    // Always return 200 to prevent Safaricom retries flooding the endpoint
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  }
}
