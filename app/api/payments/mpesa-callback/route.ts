import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { MpesaCallbackSchema } from '@/lib/validations'
import { handleError, logInfo } from '@/lib/api-error'

/**
 * M-Pesa Payment Callback Handler
 * This endpoint receives payment confirmation from M-Pesa STK Push
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    logInfo('M-Pesa callback received', { body })

    // Validate callback structure
    const callbackData = MpesaCallbackSchema.parse(body)
    const { stkCallback } = callbackData.Body

    logInfo('Processing M-Pesa callback', {
      resultCode: stkCallback.ResultCode,
      checkoutRequestId: stkCallback.CheckoutRequestID,
    })

    // Extract transaction details from callback metadata
    let mpesaTransactionId = null
    let amount = null

    if (stkCallback.CallbackMetadata?.Item) {
      for (const item of stkCallback.CallbackMetadata.Item) {
        if (item.Name === 'MpesaReceiptNumber') {
          mpesaTransactionId = item.Value
        }
        if (item.Name === 'Amount') {
          amount = item.Value
        }
      }
    }

    // Success result code is 0
    if (stkCallback.ResultCode === 0) {
      logInfo('Payment successful', {
        transactionId: mpesaTransactionId,
        amount,
      })

      // You would need to store the checkout request ID during order creation
      // and then look it up here to update the order
      // For now, we're logging the successful payment
      // In production, you should:
      // 1. Store CheckoutRequestID with the order
      // 2. Look up the order by CheckoutRequestID
      // 3. Update order payment_status to 'completed'
      // 4. Update mpesa_transaction_id
      // 5. Update order status to 'confirmed'

      return NextResponse.json({ success: true })
    } else {
      logInfo('Payment failed', {
        resultCode: stkCallback.ResultCode,
        resultDesc: stkCallback.ResultDesc,
      })

      // Payment failed - you would update order payment_status to 'failed'
      return NextResponse.json({ success: false })
    }
  } catch (error) {
    logInfo('M-Pesa callback error', { error })
    return handleError(error)
  }
}
