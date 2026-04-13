'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Header } from '@/components/header'
import { Card } from '@/components/ui/card'
import { Loader2, TrendingUp, DollarSign } from 'lucide-react'
import type { SellerEarnings } from '@/lib/types'

export default function SellerEarnings() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [earnings, setEarnings] = useState<SellerEarnings[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    paid: 0,
  })

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'seller')) {
      router.push('/seller')
      return
    }

    if (!loading && user && profile?.role === 'seller') {
      fetchEarnings()
    }
  }, [user, profile, loading, router])

  const fetchEarnings = async () => {
    try {
      const res = await fetch('/api/seller/earnings')
      if (res.ok) {
        const data = await res.json()
        setEarnings(data)
        
        // Calculate stats
        let total = 0, pending = 0, verified = 0, paid = 0
        data.forEach((e: SellerEarnings) => {
          total += e.net_earnings
          if (e.status === 'pending') pending += e.net_earnings
          if (e.status === 'verified') verified += e.net_earnings
          if (e.status === 'paid') paid += e.net_earnings
        })
        
        setStats({ total, pending, verified, paid })
      }
    } catch (error) {
      console.error('Error fetching earnings:', error)
    } finally {
      setLoadingData(false)
    }
  }

  if (loading || loadingData) {
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
        <h1 className="text-3xl font-bold mb-8">Earnings</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/60">Total Earnings</p>
                <p className="text-2xl font-bold">KSh {stats.total.toLocaleString()}</p>
              </div>
              <TrendingUp className="text-green-600" size={32} />
            </div>
          </Card>
          <Card className="p-6">
            <div>
              <p className="text-sm text-foreground/60">Pending</p>
              <p className="text-2xl font-bold">KSh {stats.pending.toLocaleString()}</p>
            </div>
          </Card>
          <Card className="p-6">
            <div>
              <p className="text-sm text-foreground/60">Verified</p>
              <p className="text-2xl font-bold">KSh {stats.verified.toLocaleString()}</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/60">Paid Out</p>
                <p className="text-2xl font-bold">KSh {stats.paid.toLocaleString()}</p>
              </div>
              <DollarSign className="text-blue-600" size={32} />
            </div>
          </Card>
        </div>

        {/* Earnings List */}
        {earnings.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-foreground/60">No earnings yet</p>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-gray-50 font-medium text-sm">
                <div>Order ID</div>
                <div>Amount</div>
                <div>Fee</div>
                <div>Net Earnings</div>
                <div>Status</div>
                <div>Date</div>
              </div>
              {earnings.map((earning) => (
                <div key={earning.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border-t">
                  <div className="text-sm font-mono">{earning.order_id?.slice(0, 8) || 'N/A'}...</div>
                  <div>KSh {earning.amount.toLocaleString()}</div>
                  <div>KSh {earning.platform_fee.toLocaleString()}</div>
                  <div className="font-bold">KSh {earning.net_earnings.toLocaleString()}</div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      earning.status === 'paid' ? 'bg-green-100 text-green-800' :
                      earning.status === 'verified' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {earning.status}
                    </span>
                  </div>
                  <div className="text-sm">{new Date(earning.created_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
