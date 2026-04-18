import { ok, fail, parseBody } from '@/lib/api-handler'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const contactSchema = z.object({
  first_name: z.string().min(1).max(50),
  last_name: z.string().min(1).max(50),
  email: z.string().email(),
  subject: z.string().min(1).max(200),
  message: z.string().min(10).max(2000),
})

const newsletterSchema = z.object({
  email: z.string().email(),
})

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
  const { error } = await supabase.from('contact_submissions').insert(body)
  if (error) { console.error('[contact/POST]', error.message); return fail('Failed to send message', 500) }
  return ok({ sent: true })
}
