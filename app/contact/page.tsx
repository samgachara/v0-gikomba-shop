'use client'
import { useState } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, Phone, MapPin, CheckCircle, Loader2 } from 'lucide-react'

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => { setLoading(false); setSent(true) }, 1200)
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
                { icon: Mail, title: 'Email', lines: ['hello@gikomba.shop', 'support@gikomba.shop'] },
                { icon: Phone, title: 'Phone / WhatsApp', lines: ['+254 700 000 000', 'Mon–Sat 8am–8pm EAT'] },
                { icon: MapPin, title: 'Address', lines: ['Nairobi, Kenya', 'Gikomba Market Area'] },
              ].map(({ icon: Icon, title, lines }) => (
                <Card key={title}>
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1">{title}</p>
                      {lines.map(l => <p key={l} className="text-sm text-muted-foreground">{l}</p>)}
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
                    <h3 className="text-xl font-semibold">Message Sent!</h3>
                    <p className="text-muted-foreground">We&apos;ll get back to you within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <h2 className="text-xl font-semibold mb-4">Send a message</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>First name</Label><Input placeholder="Sam" required /></div>
                      <div className="space-y-2"><Label>Last name</Label><Input placeholder="Gachara" required /></div>
                    </div>
                    <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="you@example.com" required /></div>
                    <div className="space-y-2"><Label>Subject</Label><Input placeholder="How can we help?" required /></div>
                    <div className="space-y-2"><Label>Message</Label><Textarea placeholder="Tell us more..." rows={4} required /></div>
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
