'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle, MapPin, Phone, CreditCard, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'

function fmt(n: number) { return `KSh ${Number(n).toLocaleString()}` }
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const STEPS = [
  { key: 'pending',    label: 'Order Placed',    icon: Clock,        desc: 'Your order has been received' },
  { key: 'confirmed',  label: 'Confirmed',        icon: CheckCircle,  desc: 'Seller confirmed your order' },
  { key: 'processing', label: 'Being Packed',     icon: Package,      desc: 'Seller is packing your item' },
  { key: 'shipped',    label: 'Out for Delivery', icon: Truck,        desc: 'Your order is on its way' },
  { key: 'delivered',  label: 'Delivered',        icon: CheckCircle,  desc: 'Order delivered successfully' },
]

const STATUS_ORDER = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login')
  }, [authLoading, user, router])

  useEffect(() => {
    if (!user || !id) return
    const supabase = createClient()
    supabase
      .from('orders')
      .select(`id, status, payment_status, payment_method, total, shipping_address, shipping_city, phone, created_at, updated_at,
               order_items(id, quantity, price, products(id, name, title, image_url))`)
      .eq('id', id)
      .eq('buyer_id', user.id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) { setError('Order not found'); setLoading(false); return }
        setOrder(data)
        setLoading(false)
      })
  }, [user, id])

  if (authLoading || loading) return (
    <div className="min-h-screen bg-background"><Header />
      <div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    </div>
  )

  if (error || !order) return (
    <div className="min-h-screen bg-background"><Header />
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground mb-4">{error || 'Order not found'}</p>
        <Button asChild variant="outline"><Link href="/account/orders">← Back to Orders</Link></Button>
      </main><Footer />
    </div>
  )

  const currentStep = order.status === 'cancelled' ? -1 : STATUS_ORDER.indexOf(order.status)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Back */}
        <Link href="/account/orders" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </Link>

        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
            <p className="text-muted-foreground text-sm mt-1">Placed {fmtDate(order.created_at)}</p>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${
            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </div>
        </div>

        {/* Status Timeline */}
        {order.status !== 'cancelled' ? (
          <Card className="mb-6">
            <CardHeader><CardTitle className="text-base">Tracking</CardTitle></CardHeader>
            <CardContent>
              <div className="relative">
                {STEPS.map((step, i) => {
                  const done    = i <= currentStep
                  const current = i === currentStep
                  const Icon    = step.icon
                  return (
                    <div key={step.key} className="flex items-start gap-4 pb-6 last:pb-0 relative">
                      {/* Vertical line */}
                      {i < STEPS.length - 1 && (
                        <div className={`absolute left-4 top-8 w-0.5 h-full -translate-x-1/2 ${i < currentStep ? 'bg-green-500' : 'bg-border'}`} />
                      )}
                      {/* Icon */}
                      <div className={`relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                        done ? 'bg-green-500 border-green-500 text-white' :
                        current ? 'bg-primary border-primary text-white' :
                        'bg-background border-border text-muted-foreground'
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      {/* Text */}
                      <div className="pt-0.5">
                        <p className={`font-medium text-sm ${done || current ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</p>
                        <p className="text-xs text-muted-foreground">{step.desc}</p>
                        {current && <p className="text-xs text-primary font-medium mt-0.5">Current status</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6 border-red-200 bg-red-50 dark:bg-red-950/20">
            <CardContent className="p-4 flex items-center gap-3">
              <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-sm font-medium text-red-700 dark:text-red-400">This order was cancelled.</p>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {/* Items */}
          <Card>
            <CardHeader><CardTitle className="text-base">Items</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {(order.order_items || []).map((item: any) => {
                const product = item.products
                return (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                      {product?.image_url
                        ? <img src={product.image_url} alt={product?.name || 'Product'} className="w-full h-full object-cover" />
                        : <Package className="h-5 w-5 m-auto text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product?.name || product?.title || 'Product'}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity} × {fmt(item.price)}</p>
                    </div>
                    <p className="text-sm font-semibold">{fmt(item.quantity * item.price)}</p>
                  </div>
                )
              })}
              <div className="border-t border-border pt-3 flex justify-between">
                <p className="font-semibold">Total</p>
                <p className="font-bold text-primary">{fmt(order.total)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Delivery address</p>
                    <p className="text-sm font-medium">{order.shipping_address}</p>
                    {order.shipping_city && <p className="text-xs text-muted-foreground">{order.shipping_city}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Contact phone</p>
                    <p className="text-sm font-medium">{order.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Payment</p>
                    <p className="text-sm font-medium capitalize">{order.payment_method} · <span className={order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}>{order.payment_status}</span></p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/40">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">Need help with this order?</p>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://wa.me/254736906440" target="_blank" rel="noopener noreferrer">WhatsApp Support</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
