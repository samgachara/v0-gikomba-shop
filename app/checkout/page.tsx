'use client'

// Force dynamic rendering — prevents SSR pre-render that throws
// "location is not defined" (browser global used in payment SDK deps)
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Loader2, ShoppingBag, MapPin, Phone,
  CreditCard, CheckCircle, AlertCircle, Smartphone
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { Header } from '@/components/header'

const CITIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret',
  'Thika', 'Kitale', 'Malindi', 'Garissa', 'Kakamega',
  'Nyeri', 'Meru', 'Kericho', 'Machakos', 'Embu',
]

function fmt(n: number) { return `KSh ${n.toLocaleString()}` }

type Step = 'details' | 'payment' | 'processing' | 'done'

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth()
  const { cart, cartLoading, cartTotal, cartCount, refreshCart } = useCart()
  const router = useRouter()

  const [step, setStep] = useState<Step>('details')
  const [form, setForm] = useState({
    shipping_address: '',
    shipping_city: '',
    phone: '',
    payment_method: 'mpesa' as 'mpesa' | 'card',
  })
  const [orderId, setOrderId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login?redirect=/checkout')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!cartLoading && cartCount === 0 && step === 'details') router.push('/cart')
  }, [cartLoading, cartCount, step, router])

  const deliveryFee = cartTotal >= 5000 ? 0 : 250
  const total = cartTotal + deliveryFee

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.shipping_address.trim()) return setError('Please enter your delivery address')
    if (!form.shipping_city) return setError('Please select your city')
    if (!form.phone.match(/^(\+254|254|0)?[71]\d{8}$/))
      return setError('Enter a valid Kenyan phone number (e.g. 0712 345 678)')

    setSubmitting(true)
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const json = await res.json()
    setSubmitting(false)

    if (!res.ok) { setError(json.error ?? 'Failed to place order. Please try again.'); return }

    setOrderId(json.data?.orderId)
    refreshCart()
    form.payment_method === 'mpesa' ? setStep('payment') : setStep('done')
  }

  const handleMpesaPay = async () => {
    if (!orderId) return
    setError(null)
    setStep('processing')

    const res = await fetch('/api/payments/mpesa/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId, phone: form.phone }),
    })
    const json = await res.json()

    if (!res.ok) {
      setError(json.error ?? 'M-Pesa request failed. Please try again.')
      setStep('payment')
      return
    }
    setStep('done')
  }

  if (authLoading || cartLoading) {
    return (
      <><Header />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </>
    )
  }
  if (!user) return null

  // ── ORDER CONFIRMED ──────────────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <><Header />
        <main className="min-h-screen bg-background py-16">
          <div className="mx-auto max-w-lg px-4 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Order Placed! 🎉</h1>
            <p className="text-muted-foreground mb-2">
              {form.payment_method === 'mpesa'
                ? 'An M-Pesa STK push has been sent to your phone. Enter your PIN to complete payment.'
                : 'Your order is confirmed and being processed.'}
            </p>
            {orderId && (
              <p className="text-sm text-muted-foreground mb-8">
                Order <span className="font-mono font-semibold">#{orderId.slice(0, 8).toUpperCase()}</span>
              </p>
            )}
            <Card className="text-left mb-8">
              <CardContent className="p-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deliver to</span>
                  <span className="font-medium text-right">{form.shipping_address}, {form.shipping_city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{form.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment</span>
                  <span className="font-medium">{form.payment_method === 'mpesa' ? 'M-Pesa' : 'Card'}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span><span>{fmt(total)}</span>
                </div>
              </CardContent>
            </Card>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" asChild><Link href="/account/orders">View Orders</Link></Button>
              <Button asChild><Link href="/shop">Continue Shopping</Link></Button>
            </div>
          </div>
        </main>
      </>
    )
  }

  // ── PROCESSING ───────────────────────────────────────────────────────────────
  if (step === 'processing') {
    return (
      <><Header />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Sending M-Pesa request…</h2>
            <p className="text-muted-foreground text-sm">Please wait while we contact Safaricom</p>
          </div>
        </main>
      </>
    )
  }

  // ── M-PESA PAYMENT ───────────────────────────────────────────────────────────
  if (step === 'payment') {
    return (
      <><Header />
        <main className="min-h-screen bg-background py-8">
          <div className="mx-auto max-w-lg px-4">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Pay with M-Pesa</h1>
                <p className="text-sm text-muted-foreground">STK push sent to {form.phone}</p>
              </div>
            </div>
            <Card className="mb-6">
              <CardContent className="p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold text-lg">{fmt(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{form.phone}</span>
                </div>
              </CardContent>
            </Card>
            {error && (
              <div className="flex items-center gap-2 p-3 mb-4 bg-destructive/10 text-destructive rounded-lg text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />{error}
              </div>
            )}
            <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg text-sm text-green-800 dark:text-green-300 mb-6">
              <p className="font-semibold mb-1">How to pay:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Tap <strong>Pay Now</strong> below</li>
                <li>A prompt will appear on <strong>{form.phone}</strong></li>
                <li>Enter your M-Pesa PIN to confirm</li>
              </ol>
            </div>
            <Button className="w-full bg-green-600 hover:bg-green-700" size="lg" onClick={handleMpesaPay}>
              Pay {fmt(total)} via M-Pesa
            </Button>
            <Button variant="ghost" className="w-full mt-3" onClick={() => setStep('details')}>← Change details</Button>
          </div>
        </main>
      </>
    )
  }

  // ── DETAILS FORM ─────────────────────────────────────────────────────────────
  return (
    <><Header />
      <main className="min-h-screen bg-background py-8">
        <div className="mx-auto max-w-5xl px-4">
          <Button variant="ghost" className="mb-6 gap-2" asChild>
            <Link href="/cart"><ArrowLeft className="h-4 w-4" />Back to Cart</Link>
          </Button>
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          <div className="grid gap-8 lg:grid-cols-5">
            <form onSubmit={handlePlaceOrder} className="lg:col-span-3 space-y-6">
              {/* Delivery */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="h-4 w-4" />Delivery Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address *</Label>
                    <Input id="address" placeholder="e.g. 45 Tom Mboya St, Apt 3A"
                      value={form.shipping_address}
                      onChange={e => setForm(f => ({ ...f, shipping_address: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <select id="city"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={form.shipping_city}
                      onChange={e => setForm(f => ({ ...f, shipping_city: e.target.value }))}>
                      <option value="">Select your city</option>
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Contact & Payment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Phone className="h-4 w-4" />Contact & Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input id="phone" placeholder="0712 345 678"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                    <p className="text-xs text-muted-foreground">Used for M-Pesa prompt and delivery updates</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Method *</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'mpesa', label: 'M-Pesa', icon: '📱', note: 'Recommended' },
                        { id: 'card',  label: 'Card',   icon: '💳', note: '' },
                      ].map(({ id, label, icon, note }) => (
                        <button key={id} type="button"
                          onClick={() => setForm(f => ({ ...f, payment_method: id as 'mpesa' | 'card' }))}
                          className={`flex items-center gap-2 p-4 rounded-lg border-2 text-sm font-medium transition-colors ${
                            form.payment_method === id ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
                          }`}>
                          <span className="text-xl">{icon}</span>
                          <span>{label}</span>
                          {note && <span className="ml-auto text-xs text-green-600 font-semibold">{note}</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />{error}
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting
                  ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Placing Order…</>
                  : <><CreditCard className="h-4 w-4 mr-2" />Place Order · {fmt(total)}</>}
              </Button>
            </form>

            {/* Summary */}
            <div className="lg:col-span-2">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ShoppingBag className="h-4 w-4" />Order Summary ({cartCount} items)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded bg-muted overflow-hidden flex-shrink-0">
                        <img src={item.product?.image_url || '/placeholder.jpg'}
                          alt={item.product?.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product?.name}</p>
                        <p className="text-xs text-muted-foreground">× {item.quantity}</p>
                      </div>
                      <span className="text-sm">{fmt((item.product?.price || 0) * item.quantity)}</span>
                    </div>
                  ))}
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span><span>{fmt(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery</span>
                      <span>{deliveryFee === 0 ? <span className="text-green-600 font-medium">Free</span> : fmt(deliveryFee)}</span>
                    </div>
                    {cartTotal > 0 && cartTotal < 5000 && (
                      <p className="text-xs text-muted-foreground">
                        Add {fmt(5000 - cartTotal)} more for free delivery
                      </p>
                    )}
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span><span>{fmt(total)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
