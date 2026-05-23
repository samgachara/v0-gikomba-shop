import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_EMAIL = 'samgachara5@gmail.com'
const SITE_URL    = 'https://gikomba.shop'
const NOTIFY_SECRET = process.env.NOTIFY_SECRET || 'gikomba-notify-2026'

function emailTemplate(title: string, body: string, ctaUrl?: string, ctaLabel?: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif">
<div style="max-width:580px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
  <div style="background:#16a34a;padding:24px 32px">
    <p style="margin:0;color:#fff;font-size:22px;font-weight:700">gikomba.shop</p>
    <p style="margin:4px 0 0;color:#bbf7d0;font-size:12px">GIKOMBA. ONLINE. DELIVERED.</p>
  </div>
  <div style="padding:32px">
    <h1 style="margin:0 0 16px;font-size:20px;color:#111827">${title}</h1>
    <div style="color:#4b5563;font-size:15px;line-height:1.6">${body}</div>
    ${ctaUrl ? `<div style="margin-top:28px"><a href="${ctaUrl}" style="background:#16a34a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">${ctaLabel || 'View Now'}</a></div>` : ''}
  </div>
  <div style="padding:20px 32px;background:#f9fafb;border-top:1px solid #e5e7eb">
    <p style="margin:0;color:#9ca3af;font-size:12px">gikomba.shop · Nairobi, Kenya</p>
  </div>
</div></body></html>`
}

async function sendEmail(to: string, subject: string, html: string) {
  // Uses Supabase's configured SMTP (set up Resend in Supabase Auth settings)
  // Falls back gracefully if not configured yet
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ecrttmokkmaqdlsxhlvv.supabase.co'
    const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    if (!serviceKey) { console.log('[notify] No service key — email skipped:', subject); return false }
    const res = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${serviceKey}` },
      body: JSON.stringify({ to, subject, html, from: 'noreply@gikomba.shop' }),
    })
    return res.ok
  } catch (e) {
    console.error('[notify] sendEmail failed:', e)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get('x-notify-secret')
    if (secret !== NOTIFY_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { type, data } = await request.json()

    switch (type) {
      case 'product_approved':
        await sendEmail(data.seller_email, `✅ Your listing is live — ${data.product_name}`,
          emailTemplate(`Your listing is approved!`,
            `<p>Hi ${data.seller_name},</p><p>Your product <strong>${data.product_name}</strong> is now live on gikomba.shop. Buyers across Kenya can find and purchase it.</p>`,
            `${SITE_URL}/product/${data.product_id}`, 'View Your Listing'))
        break

      case 'product_rejected':
        await sendEmail(data.seller_email, `Your listing needs updates — ${data.product_name}`,
          emailTemplate(`Your listing wasn't approved yet`,
            `<p>Hi ${data.seller_name},</p><p>Your product <strong>${data.product_name}</strong> couldn't be approved.</p>${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}<p>Please update and resubmit. Common issues: blurry photos, missing grade, vague description.</p>`,
            `${SITE_URL}/dashboard/seller`, 'Edit Your Listing'))
        break

      case 'new_order_seller':
        await sendEmail(data.seller_email, `🛍️ New order — KSh ${Number(data.total).toLocaleString()}`,
          emailTemplate(`You have a new order!`,
            `<p>Hi ${data.seller_name},</p><p>New order for <strong>${data.product_name}</strong> × ${data.quantity}.</p><p>Amount: <strong style="color:#16a34a">KSh ${Number(data.total).toLocaleString()}</strong></p><p>Please confirm and pack within 48 hours. Buyer phone: <strong>${data.buyer_phone}</strong></p>`,
            `${SITE_URL}/dashboard/seller`, 'View Order'))
        await sendEmail(ADMIN_EMAIL, `New order — KSh ${Number(data.total).toLocaleString()}`,
          emailTemplate(`New order on gikomba.shop`,
            `<p>Order for <strong>${data.product_name}</strong> × ${data.quantity} — KSh ${Number(data.total).toLocaleString()}</p>`,
            `${SITE_URL}/dashboard/admin`, 'View in Admin'))
        break

      case 'order_confirmed':
        await sendEmail(data.buyer_email, `Order confirmed — KSh ${Number(data.total).toLocaleString()}`,
          emailTemplate(`Your order is confirmed ✅`,
            `<p>Hi ${data.buyer_name},</p><p>Your order for <strong>${data.product_name}</strong> is confirmed. The seller is packing it now. You'll get another email when it's dispatched.</p><p style="color:#6b7280;font-size:13px">Order ref: #${data.order_id?.slice(0,8)}</p>`,
            `${SITE_URL}/account/orders`, 'Track My Order'))
        break

      case 'new_seller_signup':
        await sendEmail(ADMIN_EMAIL, `New seller — ${data.store_name}`,
          emailTemplate(`New seller joined`,
            `<p><strong>${data.store_name}</strong> (${data.seller_email}) just signed up as a seller. Products won't go live until you approve them.</p>`,
            `${SITE_URL}/dashboard/admin`, 'View in Admin'))
        break

      case 'product_pending_approval':
        await sendEmail(ADMIN_EMAIL, `⏳ Product needs review — ${data.product_name}`,
          emailTemplate(`New product to approve`,
            `<p><strong>${data.store_name}</strong> listed <strong>${data.product_name}</strong>. It's waiting for your approval.</p>`,
            `${SITE_URL}/dashboard/admin`, 'Review in Admin'))
        break

      case 'seller_no_products_reminder':
        await sendEmail(data.seller_email, `Your store is waiting for its first listing 🛍️`,
          emailTemplate(`Ready to start selling?`,
            `<p>Hi ${data.seller_name},</p><p>You set up your store ${data.days_since_signup} days ago but haven't listed any products yet. Listing is free — we only take 5% on sales. It takes under 5 minutes.</p>`,
            `${SITE_URL}/dashboard/seller`, 'List My First Product'))
        break

      default:
        return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
    }

    return NextResponse.json({ success: true, type })
  } catch (e) {
    console.error('[notify] Error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
