'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Header } from '@/components/header'
import { Card } from '@/components/ui/card'
import { Loader2, Package } from 'lucide-react'
import type { Order } from '@/lib/types'

export default function SellerOrders() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'seller')) {
      router.push('/seller')
      return
    }

    if (!loading && user && profile?.role === 'seller') {
      fetchOrders()
    }
  }, [user, profile, loading, router])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/seller/orders')
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoadingOrders(false)
    }
  }

  if (loading || loadingOrders) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex items-center justify-center h-96">
          <Loader2 className="animate-spin" />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <Card className="p-12 text-center">
            <Package size={48} className="mx-auto text-foreground/30 mb-4" />
            <p className="text-foreground/60">No orders yet</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-sm text-foreground/60">Order ID</p>
                    <p className="font-mono text-sm">{order.id.slice(0, 8)}...</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/60">Date</p>
                    <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/60">Total</p>
                    <p className="font-bold">KSh {order.total.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/60">Status</p>
                    <p className="font-medium capitalize">{order.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/60">Items</p>
                    <p className="font-medium">{order.items?.length || 0}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
