'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function SellerRegister() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    shop_name: '',
    shop_description: '',
    bank_account: '',
    bank_name: '',
    mpesa_phone: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="animate-spin" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Sign in required</h1>
          <p className="text-foreground/60 mb-6">Please sign in to register as a seller</p>
          <Link href="/auth/sign-in">
            <Button>Sign In</Button>
          </Link>
        </main>
      </div>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to register vendor')
      }

      router.push('/seller')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Become a Seller</h1>
          <p className="text-foreground/60">Fill out your shop information to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg border">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Shop Name *</label>
            <Input
              type="text"
              name="shop_name"
              value={formData.shop_name}
              onChange={handleChange}
              placeholder="Your shop name"
              required
              minLength={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Shop Description</label>
            <textarea
              name="shop_description"
              value={formData.shop_description}
              onChange={handleChange}
              placeholder="Describe your shop and what you sell"
              className="w-full p-2 border rounded-lg"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bank Account</label>
            <Input
              type="text"
              name="bank_account"
              value={formData.bank_account}
              onChange={handleChange}
              placeholder="Your bank account number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bank Name</label>
            <Input
              type="text"
              name="bank_name"
              value={formData.bank_name}
              onChange={handleChange}
              placeholder="Name of your bank"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">M-Pesa Phone</label>
            <Input
              type="tel"
              name="mpesa_phone"
              value={formData.mpesa_phone}
              onChange={handleChange}
              placeholder="254712345678"
              pattern="254\d{9}"
            />
            <p className="text-xs text-foreground/60 mt-1">Format: 254712345678</p>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Registering...
                </>
              ) : (
                'Register as Seller'
              )}
            </Button>
            <Link href="/">
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>

          <p className="text-xs text-foreground/60">
            Your application will be reviewed by our team. You&apos;ll be notified once approved.
          </p>
        </form>
      </main>
    </div>
  )
}
