'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users, Package, ShoppingBag, TrendingUp, Loader2, RefreshCw,
  DollarSign, AlertCircle, CheckCircle, Clock, XCircle, BarChart2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/lib/auth-context'
import { Header } from '@/components/header'

interface AdminStats {
  totalUsers: number
  totalProducts: number
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
  roleBreakdown: Record<string, number>
  recentOrders: {
    id: string; total: number; status: string
    payment_status: string; payment_method: string; created_at: string
  }[]
  topProducts: {
    id: string; title: string; price: number; stock: number; num_reviews: number; category: string
  }[]
}

function fmt(n: number) { return `KSh ${n.toLocaleString()}` }

const STATUS_STYLE: Record<string, { cls: string; icon: React.ReactNode }> = {
  pending:    { cls: 'bg-yellow-100 text-yellow-800',  icon: <Clock className="h-3 w-3" /> },
  confirmed:  { cls: 'bg-blue-100 text-blue-800',      icon: <CheckCircle className="h-3 w-3" /> },
  processing: { cls: 'bg-indigo-100 text-indigo-800',  icon: <Clock className="h-3 w-3" /> },
  shipped:    { cls: 'bg-purple-100 text-purple-800',  icon: <TrendingUp className="h-3 w-3" /> },
  delivered:  { cls: 'bg-green-100 text-green-800',    icon: <CheckCircle className="h-3 w-3" /> },
  cancelled:  { cls: 'bg-red-100 text-red-800',        icon: <XCircle className="h-3 w-3" /> },
  completed:  { cls: 'bg-green-100 text-green-800',    icon: <CheckCircle className="h-3 w-3" /> },
  failed:     { cls: 'bg-red-100 text-red-800',        icon: <XCircle className="h-3 w-3" /> },
}

function StatusPill({ status }: { status: string }) {
  const { cls, icon } = STATUS_STYLE[status] ?? { cls: 'bg-gray-100 text-gray-700', icon: null }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {icon}{status}
    </span>
  )
}

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)
  const [tab, setTab] = useState<'overview' | 'orders' | 'products' | 'users'>('overview')

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login')
  }, [user, authLoading, router])

  const loadStats = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/stats')
    if (res.status === 403) { setForbidden(true); setLoading(false); return }
    if (res.ok) setStats(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { if (user) loadStats() }, [user, loadStats])

  if (authLoading || loading) {
    return (
      <><Header />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </>
    )
  }

  if (forbidden) {
    return (
      <><Header />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground">You need admin privileges to view this page.</p>
          </div>
        </main>
      </>
    )
  }

  const kpis = [
    { label: 'Total Users',      value: stats?.totalUsers ?? 0,    icon: Users,       bg: 'bg-blue-100',   ic: 'text-blue-600' },
    { label: 'Active Products',  value: stats?.totalProducts ?? 0, icon: Package,     bg: 'bg-purple-100', ic: 'text-purple-600' },
    { label: 'Total Orders',     value: stats?.totalOrders ?? 0,   icon: ShoppingBag, bg: 'bg-orange-100', ic: 'text-orange-600' },
    { label: 'Total Revenue',    value: fmt(stats?.totalRevenue ?? 0), icon: DollarSign, bg: 'bg-green-100', ic: 'text-green-600' },
  ]

  return (
    <><Header />
      <main className="min-h-screen bg-background py-8">
        <div className="mx-auto max-w-6xl px-4">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Admin Panel</h1>
              <p className="text-muted-foreground mt-1">Platform-wide metrics &amp; management</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2" onClick={loadStats}>
              <RefreshCw className="h-4 w-4" />Refresh
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-8 border-b">
            {(['overview', 'orders', 'products', 'users'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                  tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}>
                {t}
                {t === 'orders' && (stats?.pendingOrders ?? 0) > 0 && (
                  <span className="ml-2 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {stats!.pendingOrders}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* OVERVIEW */}
          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {kpis.map(({ label, value, icon: Icon, bg, ic }) => (
                  <Card key={label}>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-muted-foreground">{label}</span>
                        <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
                          <Icon className={`h-5 w-5 ${ic}`} />
                        </div>
                      </div>
                      <p className="text-2xl font-bold">{value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {/* Revenue summary */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart2 className="h-4 w-4" />Business Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { label: 'Completed Revenue',   value: fmt(stats?.totalRevenue ?? 0),     icon: CheckCircle, cls: 'text-green-600' },
                      { label: 'Pending Orders',      value: `${stats?.pendingOrders ?? 0} orders`, icon: Clock, cls: 'text-yellow-600' },
                      { label: 'Avg Order Value',     value: stats && stats.totalOrders > 0 ? fmt(Math.round(stats.totalRevenue / stats.totalOrders)) : 'KSh 0', icon: TrendingUp, cls: 'text-blue-600' },
                      { label: 'Order Conversion',    value: stats && stats.totalUsers > 0 ? `${((stats.totalOrders / stats.totalUsers) * 100).toFixed(1)}%` : '0%', icon: BarChart2, cls: 'text-purple-600' },
                    ].map(({ label, value, icon: Icon, cls }) => (
                      <div key={label} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Icon className={`h-4 w-4 ${cls}`} />
                          <span className="text-sm">{label}</span>
                        </div>
                        <span className="text-sm font-semibold">{value}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* User breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4" />User Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(['buyer', 'seller', 'admin'] as const).map(role => {
                      const count = stats?.roleBreakdown[role] ?? 0
                      const total = stats?.totalUsers || 1
                      const pct = Math.round((count / total) * 100)
                      const colors: Record<string, string> = { buyer: 'bg-blue-500', seller: 'bg-purple-500', admin: 'bg-red-500' }
                      return (
                        <div key={role}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="capitalize">{role}s</span>
                            <span className="font-medium">{count} ({pct}%)</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full ${colors[role]} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                    <Separator />
                    <div className="flex justify-between text-sm font-semibold">
                      <span>Total</span><span>{stats?.totalUsers ?? 0}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* ORDERS */}
          {tab === 'orders' && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Recent Orders</h2>
              {(stats?.recentOrders ?? []).length === 0 ? (
                <Card><CardContent className="py-16 text-center text-muted-foreground">
                  <ShoppingBag className="h-10 w-10 mx-auto mb-3" />No orders yet
                </CardContent></Card>
              ) : stats?.recentOrders.map(order => (
                <Card key={order.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleString('en-KE')} ·&nbsp;
                        {order.payment_method === 'mpesa' ? 'M-Pesa' : 'Card'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusPill status={order.status} />
                      <StatusPill status={order.payment_status} />
                      <span className="font-semibold text-sm w-24 text-right">{fmt(order.total)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* PRODUCTS */}
          {tab === 'products' && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Top Products</h2>
              {(stats?.topProducts ?? []).length === 0 ? (
                <Card><CardContent className="py-16 text-center text-muted-foreground">
                  <Package className="h-10 w-10 mx-auto mb-3" />No products yet
                </CardContent></Card>
              ) : stats?.topProducts.map((p, i) => (
                <Card key={p.id}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{p.category} · {p.num_reviews} reviews · {p.stock} in stock</p>
                    </div>
                    <span className="font-semibold text-sm">{fmt(p.price)}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* USERS */}
          {tab === 'users' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">User Statistics</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {(['buyer', 'seller', 'admin'] as const).map(role => {
                  const count = stats?.roleBreakdown[role] ?? 0
                  const colors: Record<string, string> = {
                    buyer:  'border-blue-200 bg-blue-50 dark:bg-blue-950/20',
                    seller: 'border-purple-200 bg-purple-50 dark:bg-purple-950/20',
                    admin:  'border-red-200 bg-red-50 dark:bg-red-950/20',
                  }
                  const textColors: Record<string, string> = {
                    buyer: 'text-blue-700 dark:text-blue-300',
                    seller: 'text-purple-700 dark:text-purple-300',
                    admin: 'text-red-700 dark:text-red-300',
                  }
                  return (
                    <Card key={role} className={`border-2 ${colors[role]}`}>
                      <CardContent className="p-6 text-center">
                        <p className={`text-4xl font-bold mb-1 ${textColors[role]}`}>{count}</p>
                        <p className={`text-sm font-medium capitalize ${textColors[role]}`}>{role}s</p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
              <Card>
                <CardContent className="p-5">
                  <p className="text-sm text-muted-foreground">
                    To promote a user to seller or admin, update their <code className="bg-muted px-1 rounded">role</code> in
                    the <code className="bg-muted px-1 rounded">profiles</code> table in Supabase.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </main>
    </>
  )
}
