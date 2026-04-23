'use client'
import { useState } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, Phone, MapPin, CheckCircle, Loader2, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', subject: '', message: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { error: dbError } = await supabase.from('contact_submissions').insert({
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        subject: form.subject,
        message: form.message,
      })
      if (dbError) throw dbError
      setSent(true)
    } catch (err: any) {
      setError('Something went wrong. Please try WhatsApp or email us directly.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-muted-foreground text-lg">We&apos;re here to help. Reach out any time.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              {[
                {
                  icon: MessageCircle,
                  title: 'WhatsApp (Fastest)',
                  lines: ['+254 736 906 440', 'Mon–Sat 8am–8pm EAT'],
                  href: 'https://wa.me/254736906440'
                },
                {
                  icon: Mail,
                  title: 'Email',
                  lines: ['hello@gikomba.shop', 'support@gikomba.shop'],
                  href: 'mailto:hello@gikomba.shop'
                },
                {
                  icon: Phone,
                  title: 'Phone',
                  lines: ['+254 736 906 440', 'Mon–Sat 8am–8pm EAT'],
                  href: 'tel:+254736906440'
                },
                {
                  icon: MapPin,
                  title: 'Address',
                  lines: ['Nairobi, Kenya', 'Business Registration: In Progress'],
                  href: undefined
                },
              ].map(({ icon: Icon, title, lines, href }) => (
                <Card key={title} className={href ? 'hover:border-primary/50 transition-colors cursor-pointer' : ''}>
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1">{title}</p>
                      {lines.map(l => (
                        href ? (
                          <a key={l} href={href} target="_blank" rel="noopener noreferrer"
                            className="text-sm text-muted-foreground hover:text-primary transition-colors block">
                            {l}
                          </a>
                        ) : (
                          <p key={l} className="text-sm text-muted-foreground">{l}</p>
                        )
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
              <CardContent className="p-6">
                {sent ? (
                  <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                    <CheckCircle className="w-16 h-16 text-green-500" />
                    <h3 className="text-xl font-semibold">Message Received!</h3>
                    <p className="text-muted-foreground">We&apos;ll get back to you within 24 hours.</p>
                    <p className="text-sm text-muted-foreground">For faster help, WhatsApp us at +254 736 906 440</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <h2 className="text-xl font-semibold mb-4">Send a message</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>First name</Label>
                        <Input name="firstName" placeholder="Sam" required value={form.firstName} onChange={handleChange} />
                      </div>
                      <div className="space-y-2">
                        <Label>Last name</Label>
                        <Input name="lastName" placeholder="Gachara" required value={form.lastName} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input name="email" type="email" placeholder="you@example.com" required value={form.email} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label>Subject</Label>
                      <Input name="subject" placeholder="How can we help?" required value={form.subject} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label>Message</Label>
                      <Textarea name="message" placeholder="Tell us more..." rows={4} required value={form.message} onChange={handleChange} />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</> : 'Send Message'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
