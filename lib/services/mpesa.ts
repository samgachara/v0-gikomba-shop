/**
 * Safaricom Daraja M-Pesa STK Push service
 * Docs: https://developer.safaricom.co.ke/APIs/MpesaExpressSimulate
 */

const DARAJA_BASE =
  process.env.NODE_ENV === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke'

async function getAccessToken(): Promise<string> {
  const key = process.env.MPESA_CONSUMER_KEY!
  const secret = process.env.MPESA_CONSUMER_SECRET!
  const credentials = Buffer.from(`${key}:${secret}`).toString('base64')

  const res = await fetch(
    `${DARAJA_BASE}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: { Authorization: `Basic ${credentials}` },
      cache: 'no-store',
    },
  )

  if (!res.ok) throw new Error('Failed to get M-Pesa access token')
  const data = await res.json()
  return data.access_token
}

function getTimestamp(): string {
  return new Date()
    .toISOString()
    .replace(/[-:T.Z]/g, '')
    .slice(0, 14)
}

function getPassword(timestamp: string): string {
  const shortcode = (process.env.MPESA_SHORTCODE ?? process.env.MPESA_BUSINESS_SHORT_CODE)!
  const passkey = process.env.MPESA_PASSKEY!
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64')
}

/** Normalize phone number to 254XXXXXXXXX format */
export function normalizeMpesaPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0')) return '254' + digits.slice(1)
  if (digits.startsWith('254')) return digits
  if (digits.startsWith('+254')) return digits.slice(1)
  return digits
}

export interface StkPushResult {
  CheckoutRequestID: string
  ResponseCode: string
  ResponseDescription: string
  CustomerMessage: string
}

export async function initiateStkPush(params: {
  phone: string
  amount: number
  orderId: string
  description: string
}): Promise<StkPushResult> {
  const token = await getAccessToken()
  const timestamp = getTimestamp()
  const password = getPassword(timestamp)
  const phone = normalizeMpesaPhone(params.phone)

  const body = {
    BusinessShortCode: process.env.MPESA_SHORTCODE ?? process.env.MPESA_BUSINESS_SHORT_CODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.ceil(params.amount), // M-Pesa requires whole numbers
    PartyA: phone,
    PartyB: process.env.MPESA_SHORTCODE ?? process.env.MPESA_BUSINESS_SHORT_CODE,
    PhoneNumber: phone,
    CallBackURL: process.env.MPESA_CALLBACK_URL,
    AccountReference: `GKB-${params.orderId.slice(0, 8).toUpperCase()}`,
    TransactionDesc: params.description,
  }

  const res = await fetch(`${DARAJA_BASE}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`STK Push failed: ${err}`)
  }

  return res.json()
}
