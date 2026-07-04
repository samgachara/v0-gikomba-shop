import { ok, fail, parseBody } from '@/lib/api-handler'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const contactSchema = z.object({
  first_name: z.string().min(1).max(50),
  last_name:  z.string().min(1).max(50),
  email:      z.string().email(),
  subject:    z.string().min(1).max(200),
  message:    z.string().min(10).max(2000),
  website:    z.string().optional(), // honeypot field — must be empty
})

const newsletterSchema = z.object({
  email: z.string().email(),
})

// Simple bot signals — if 2+ match, it's a bot
function isBot(body: { first_name: string; last_name: string; email: string; message: string; website?: string }) {
  let score = 0
  if (body.website && body.website.length > 0) score += 10          // honeypot filled
  if (/^[A-Z][a-zA-Z]{14,}$/.test(body.first_name)) score += 3     // random CamelCase name > 14 chars
  if (/^[A-Z][a-zA-Z]{14,}$/.test(body.last_name))  score += 3
  if (/\.[a-z]\.[a-z]/.test(body.email)) score += 3                 // dotted email pattern
  if (/^[A-Z]{10,}$/.test(body.message)) score += 3                 // all-caps gibberish message
  if (body.message === body.first_name || body.message === body.last_name) score += 5
  return score >= 3
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const supabase = await createClient()

  if (type === 'newsletter') {
    const { data: body, error: bodyErr } = await parseBody(request, newsletterSchema)
    if (bodyErr) return bodyErr
    const { error } = await supabase
      .from('newsletter_subscribers')
      .upsert({ email: body.email }, { onConflict: 'email' })
    if (error) return fail('Failed to subscribe', 500)
    return ok({ subscribed: true })
  }

  const { data: body, error: bodyErr } = await parseBody(request, contactSchema)
  if (bodyErr) return bodyErr

  // Silently drop bots — return success so they don't retry
  if (isBot(body)) return ok({ sent: true })

  const { website: _, ...safeBody } = body  // strip honeypot before saving
  const { error } = await supabase.from('contact_submissions').insert(safeBody)
  if (error) { console.error('[contact/POST]', error.message); return fail('Failed to send message', 500) }
  return ok({ sent: true })
}
