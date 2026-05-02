'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, Store, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function SellerRegister() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({ store_name: '', description: '', location: '', mpesa_phone: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (loading) return (
    <div className="min-h-screen bg-background"><Header />
      <div className="flex items-center justify-center h-96"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
    </div>
  )

  if (!user) return (
    <div className="min-h-screen bg-background"><Header />
      <main className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Sign in required</h1>
        <p className="text-muted-foreground mb-6">Please sign in to register as a seller</p>
        <Button asChild><Link href="/auth/login">Sign In</Link></Button>
      </main>
    </div>
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.store_name.trim()) { setError('Store name is required'); return }
    setSubmitting(true); setError(null)
    try {
      const res = await fetch('/api/sellers', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to register store')
      router.push('/dashboard/seller')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally { setSubmitting(false) }
  }

  return (
    <div className="min-h-screen bg-background"><Header />
      <main className="max-w-xl mx-auto px-4 py-12">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
              <Store className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Set Up Your Store</CardTitle>
            <CardDescription>Complete your seller profile to start listing products</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="flex items-center gap-2 p-3 mb-4 bg-destructive/10 text-destructive rounded-lg text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />{error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="store_name">Store Name *</Label>
                <Input id="store_name" placeholder="e.g. Nairobi Fashion Hub" value={formData.store_name}
                  onChange={e => setFormData(f => ({ ...f, store_name: e.target.value }))} disabled={submitting} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Store Description</Label>
                <Textarea id="description" placeholder="Tell buyers about your store..." rows={3} value={formData.description}
                  onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} disabled={submitting} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="e.g. Nairobi, Kenya" value={formData.location}
                  onChange={e => setFormData(f => ({ ...f, location: e.target.value }))} disabled={submitting} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mpesa_phone">M-Pesa Phone Number</Label>
                <Input id="mpesa_phone" type="tel" placeholder="+254 7XX XXX XXX" value={formData.mpesa_phone}
                  onChange={e => setFormData(f => ({ ...f, mpesa_phone: e.target.value }))} disabled={submitting} />
                <p className="text-xs text-muted-foreground">For receiving payouts from sales</p>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Setting up store...</> : 'Create My Store'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
