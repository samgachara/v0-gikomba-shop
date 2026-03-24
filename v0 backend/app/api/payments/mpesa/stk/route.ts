import { withApiHandler } from '@/lib/api/handler'
import { fail, ok } from '@/lib/api/response'
import { z } from 'zod'

const schema = z.object({
  order_id: z.string().uuid(),
  phone: z.string().min(10).max(20),
})

export const POST = withApiHandler(
  async ({ body }) => {
    const baseUrl = process.env.MPESA_BASE_URL
    const consumerKey = process.env.MPESA_CONSUMER_KEY
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET
    const shortCode = process.env.MPESA_SHORTCODE
    const passKey = process.env.MPESA_PASSKEY
    const callbackUrl = process.env.MPESA_CALLBACK_URL

    if (!baseUrl || !consumerKey || !consumerSecret || !shortCode || !passKey || !callbackUrl) {
      return fail('M-Pesa is not configured', 500)
    }

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')
    const tokenRes = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: `Basic ${auth}` },
    })
    const tokenData = await tokenRes.json()
    if (!tokenRes.ok || !tokenData.access_token) return fail('Failed to authenticate M-Pesa', 500)

    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)
    const password = Buffer.from(`${shortCode}${passKey}${timestamp}`).toString('base64')

    const stkRes = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: 1,
        PartyA: body.phone,
        PartyB: shortCode,
        PhoneNumber: body.phone,
        CallBackURL: callbackUrl,
        AccountReference: body.order_id,
        TransactionDesc: 'Order payment',
      }),
    })

    const stkData = await stkRes.json()
    if (!stkRes.ok) return fail('Failed to initiate M-Pesa payment', 400)
    return ok(stkData)
  },
  { requireAuth: true, schema, rateLimit: { maxRequests: 10, windowMs: 60_000 } },
)
