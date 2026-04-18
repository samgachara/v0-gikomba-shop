'use client'

export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { User, Package, Heart, LogOut, Loader2, ShoppingBag, Truck, CheckCircle, Clock, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/lib/auth-context'
import { Header } from '@/components/header'

interface OrderItem {
  id: string
  quantity: number
  price: number
  product?: { id: string; name: string; title: string; image_url: string | null; price: number }
}

interface Order {
  id: string
  total: number
  status: string
  payment_status: string
  payment_method: string
  shipping_address: string | null
  shipping_city: string | null
  created_at: string
  items: OrderItem[]
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (res.status === 401) return { orders: [] }
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Failed to load orders')
  // API returns { success: true, data: { orders: [...], meta: {...} } }
  return json.data ?? { orders: [] }
}

function fmt(n: number) { return `KSh ${n.toLocaleString()}` }
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' })
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; icon: React.ReactNode }> = {
    pending:   { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3" /> },
    confirmed: { color: 'bg-blue-100 text-blue-800',    icon: <CheckCircle className="h-3 w-3" /> },
    processing:{ color: 'bg-indigo-100 text-indigo-800',icon: <Clock className="h-3 w-3" /> },
    shipped:   { color: 'bg-purple-100 text-purple-800',icon: <Truck className="h-3 w-3" /> },
    delivered: { color: 'bg-green-100 text-green-800',  icon: <CheckCircle className="h-3 w-3" /> },
    cancelled: { color: 'bg-red-100 text-red-800',      icon: <XCircle className="h-3 w-3" /> },
  }
  const { color, icon } = config[status] ?? { color: 'bg-gray-100 text-gray-800', icon: null }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {icon}{status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

export default function OrdersPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const { data, isLoading, error } = useSWR<{ orders: Order[] }>('/api/orders', fetcher)
  const orders = data?.orders ?? []

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login')
  }, [user, authLoading, router])

  if (authLoading || isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background py-8">
          <div className="mx-auto max-w-4xl px-4 flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </>
    )
  }

  if (!user) return null

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-8">
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="text-3xl font-bold mb-8">My Orders</h1>

          <div className="grid gap-6 md:grid-cols-4">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <Card>
                <CardContent className="p-4">
                  <nav className="space-y-1">
                    <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                      <Link href="/account"><User className="h-4 w-4" />Profile</Link>
                    </Button>
                    <Button variant="secondary" className="w-full justify-start gap-2" asChild>
                      <Link href="/account/orders"><Package className="h-4 w-4" />Orders</Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                      <Link href="/wishlist"><Heart className="h-4 w-4" />Wishlist</Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                      onClick={signOut}
                    >
                      <LogOut className="h-4 w-4" />Sign Out
                    </Button>
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Orders */}
            <div className="md:col-span-3 space-y-4">
              {error ? (
                <Card>
                  <CardContent className="py-12 text-center text-destructive">
                    Failed to load orders. Please refresh.
                  </CardContent>
                </Card>
              ) : orders.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">No orders yet</p>
                    <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
                    <Button asChild><Link href="/shop">Browse Products</Link></Button>
                  </CardContent>
                </Card>
              ) : (
                orders.map(order => (
                  <Card key={order.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                          <p className="text-sm text-muted-foreground">{fmtDate(order.created_at)}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <StatusBadge status={order.status} />
                          <Badge variant="outline" className="text-xs">
                            {order.payment_method === 'mpesa' ? 'M-Pesa' : 'Card'} · {order.payment_status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {(order.items ?? []).map(item => (
                          <div key={item.id} className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded bg-muted overflow-hidden flex-shrink-0">
                              <img
                                src={item.product?.image_url || '/placeholder.jpg'}
                                alt={item.product?.name || item.product?.title || ''}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {item.product?.name || item.product?.title || 'Product'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.quantity} × {fmt(item.price)}
                              </p>
                            </div>
                            <span className="text-sm font-medium">{fmt(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      <Separator className="my-3" />
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">
                          {order.shipping_city}{order.shipping_address ? `, ${order.shipping_address}` : ''}
                        </p>
                        <p className="font-semibold">{fmt(order.total)}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
