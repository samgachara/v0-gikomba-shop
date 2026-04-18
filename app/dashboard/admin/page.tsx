'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users, Package, ShoppingBag, TrendingUp, Loader2, RefreshCw,
  DollarSign, AlertCircle, CheckCircle, Clock, XCircle, BarChart2,
  Store, Banknote, UserCheck, UserX, ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import { Header } from '@/components/header'

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface Seller {
  id: string
  store_name: string
  status: string
  verified: boolean
  created_at: string
  profiles?: { first_name: string | null; last_name: string | null; phone: string | null } | null
}

interface Payout {
  id: string
  seller_id: string
  amount: number
  net_amount: number
  commission_amount: number
  status: string
  mpesa_phone: string | null
  mpesa_receipt: string | null
  notes: string | null
  created_at: string
  sellers?: { store_name: string } | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [stats,     setStats]     = useState<AdminStats | null>(null)
  const [sellers,   setSellers]   = useState<Seller[]>([])
  const [payouts,   setPayouts]   = useState<Payout[]>([])
  const [loading,   setLoading]   = useState(true)
  const [forbidden, setForbidden] = useState(false)
  const [tab,       setTab]       = useState<'overview' | 'orders' | 'products' | 'sellers' | 'payouts' | 'users'>('overview')

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login')
  }, [user, authLoading, router])

  const loadStats = useCallback(async () => {
    setLoading(true)
    const [statsRes, sellersRes, payoutsRes] = await Promise.all([
      fetch('/api/admin/stats'),
      fetch('/api/admin/sellers'),
      fetch('/api/admin/payouts'),
    ])
    if (statsRes.status === 403) { setForbidden(true); setLoading(false); return }
    if (statsRes.ok)   setStats(await statsRes.json())
    if (sellersRes.ok) {
      const d = await sellersRes.json()
      setSellers(Array.isArray(d) ? d : d.sellers ?? [])
    }
    if (payoutsRes.ok) {
      const d = await payoutsRes.json()
      setPayouts(Array.isArray(d) ? d : d.payouts ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { if (user) loadStats() }, [user, loadStats])

  // Approve / reject / verify seller
  const handleSellerAction = async (sellerId: string, action: 'approve' | 'reject' | 'verify') => {
    setActionLoadingId(sellerId)
    const statusMap = { approve: 'active', reject: 'suspended', verify: 'active' }
    const res = await fetch(`/api/admin/sellers`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        seller_id: sellerId,
        status: statusMap[action],
        verified: action === 'verify' ? true : undefined,
      }),
    })
    if (res.ok) {
      setSellers(prev => prev.map(s =>
        s.id === sellerId
          ? { ...s, status: statusMap[action], verified: action === 'verify' ? true : s.verified }
          : s
      ))
    }
    setActionLoadingId(null)
  }

  // Update payout status
  const handlePayoutUpdate = async (payoutId: string, status: 'processing' | 'paid', receipt?: string) => {
    setActionLoadingId(payoutId)
    const res = await fetch('/api/admin/payouts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payout_id: payoutId, status, mpesa_receipt: receipt }),
    })
    if (res.ok) {
      setPayouts(prev => prev.map(p => p.id === payoutId ? { ...p, status } : p))
    }
    setActionLoadingId(null)
  }

  // ── Loading / access denied ─────────────────────────────────────────────────
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

  const pendingSellers = sellers.filter(s => s.status === 'pending' || (!s.verified && s.status === 'active'))
  const pendingPayouts = payouts.filter(p => p.status === 'pending')

  const kpis = [
    { label: 'Total Users',     value: stats?.totalUsers ?? 0,    icon: Users,       bg: 'bg-blue-100',   ic: 'text-blue-600' },
    { label: 'Active Products', value: stats?.totalProducts ?? 0, icon: Package,     bg: 'bg-purple-100', ic: 'text-purple-600' },
    { label: 'Total Orders',    value: stats?.totalOrders ?? 0,   icon: ShoppingBag, bg: 'bg-orange-100', ic: 'text-orange-600' },
    { label: 'Total Revenue',   value: fmt(stats?.totalRevenue ?? 0), icon: DollarSign, bg: 'bg-green-100', ic: 'text-green-600' },
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
          <div className="flex gap-1 mb-8 border-b overflow-x-auto">
            {(['overview', 'orders', 'products', 'sellers', 'payouts', 'users'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px whitespace-nowrap ${
                  tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}>
                {t}
                {t === 'orders' && (stats?.pendingOrders ?? 0) > 0 && (
                  <span className="ml-2 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">{stats!.pendingOrders}</span>
                )}
                {t === 'sellers' && pendingSellers.length > 0 && (
                  <span className="ml-2 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingSellers.length}</span>
                )}
                {t === 'payouts' && pendingPayouts.length > 0 && (
                  <span className="ml-2 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingPayouts.length}</span>
                )}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW ── */}
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
                <Card className="md:col-span-2">
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart2 className="h-4 w-4" />Business Summary</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { label: 'Completed Revenue', value: fmt(stats?.totalRevenue ?? 0),     icon: CheckCircle, cls: 'text-green-600' },
                      { label: 'Pending Orders',    value: `${stats?.pendingOrders ?? 0} orders`, icon: Clock, cls: 'text-yellow-600' },
                      { label: 'Avg Order Value',   value: stats && stats.totalOrders > 0 ? fmt(Math.round(stats.totalRevenue / stats.totalOrders)) : 'KSh 0', icon: TrendingUp, cls: 'text-blue-600' },
                      { label: 'Order Conversion',  value: stats && stats.totalUsers > 0 ? `${((stats.totalOrders / stats.totalUsers) * 100).toFixed(1)}%` : '0%', icon: BarChart2, cls: 'text-purple-600' },
                      { label: 'Active Sellers',    value: `${sellers.filter(s => s.status === 'active').length} of ${sellers.length}`, icon: Store, cls: 'text-indigo-600' },
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

                <Card>
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" />User Breakdown</CardTitle></CardHeader>
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

          {/* ── ORDERS ── */}
          {tab === 'orders' && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Recent Orders</h2>
              {(stats?.recentOrders ?? []).length === 0 ? (
                <Card><CardContent className="py-16 text-center text-muted-foreground"><ShoppingBag className="h-10 w-10 mx-auto mb-3" />No orders yet</CardContent></Card>
              ) : stats?.recentOrders.map(order => (
                <Card key={order.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleString('en-KE')} · {order.payment_method === 'mpesa' ? 'M-Pesa' : 'Card'}
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

          {/* ── PRODUCTS ── */}
          {tab === 'products' && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Top Products</h2>
              {(stats?.topProducts ?? []).length === 0 ? (
                <Card><CardContent className="py-16 text-center text-muted-foreground"><Package className="h-10 w-10 mx-auto mb-3" />No products yet</CardContent></Card>
              ) : stats?.topProducts.map((p, i) => (
                <Card key={p.id}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
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

          {/* ── SELLERS ── */}
          {tab === 'sellers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Seller Management</h2>
                <div className="flex gap-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Active: {sellers.filter(s => s.status === 'active').length}</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />Pending: {sellers.filter(s => s.status === 'pending').length}</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Suspended: {sellers.filter(s => s.status === 'suspended').length}</span>
                </div>
              </div>

              {sellers.length === 0 ? (
                <Card><CardContent className="py-16 text-center text-muted-foreground"><Store className="h-10 w-10 mx-auto mb-3" />No sellers registered yet</CardContent></Card>
              ) : (
                <div className="grid gap-3">
                  {sellers.map(seller => (
                    <Card key={seller.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <p className="font-medium">{seller.store_name}</p>
                              {seller.verified && (
                                <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                  <ShieldCheck className="h-3 w-3" />Verified
                                </span>
                              )}
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                seller.status === 'active' ? 'bg-green-100 text-green-700'
                                  : seller.status === 'pending' ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {seller.status}
                              </span>
                            </div>
                            {seller.profiles && (
                              <p className="text-sm text-muted-foreground">
                                {[seller.profiles.first_name, seller.profiles.last_name].filter(Boolean).join(' ')}
                                {seller.profiles.phone && ` · ${seller.profiles.phone}`}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              Joined {new Date(seller.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                            {seller.status !== 'active' && (
                              <Button size="sm" variant="outline" className="gap-1.5 text-xs text-green-700 border-green-300 hover:bg-green-50"
                                disabled={actionLoadingId === seller.id}
                                onClick={() => handleSellerAction(seller.id, 'approve')}>
                                {actionLoadingId === seller.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserCheck className="h-3.5 w-3.5" />}
                                Approve
                              </Button>
                            )}
                            {!seller.verified && seller.status === 'active' && (
                              <Button size="sm" variant="outline" className="gap-1.5 text-xs text-blue-700 border-blue-300 hover:bg-blue-50"
                                disabled={actionLoadingId === seller.id}
                                onClick={() => handleSellerAction(seller.id, 'verify')}>
                                {actionLoadingId === seller.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                                Verify
                              </Button>
                            )}
                            {seller.status === 'active' && (
                              <Button size="sm" variant="outline" className="gap-1.5 text-xs text-red-700 border-red-300 hover:bg-red-50"
                                disabled={actionLoadingId === seller.id}
                                onClick={() => handleSellerAction(seller.id, 'reject')}>
                                {actionLoadingId === seller.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserX className="h-3.5 w-3.5" />}
                                Suspend
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PAYOUTS ── */}
          {tab === 'payouts' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Payout Management</h2>
              <div className="grid gap-3 sm:grid-cols-3 mb-2">
                {[
                  { label: 'Pending', count: payouts.filter(p => p.status === 'pending').length,    cls: 'text-yellow-600' },
                  { label: 'Processing', count: payouts.filter(p => p.status === 'processing').length, cls: 'text-blue-600' },
                  { label: 'Paid', count: payouts.filter(p => p.status === 'paid').length,         cls: 'text-green-600' },
                ].map(({ label, count, cls }) => (
                  <Card key={label}><CardContent className="p-4">
                    <p className={`text-2xl font-bold ${cls}`}>{count}</p>
                    <p className="text-sm text-muted-foreground">{label}</p>
                  </CardContent></Card>
                ))}
              </div>

              {payouts.length === 0 ? (
                <Card><CardContent className="py-16 text-center text-muted-foreground"><Banknote className="h-10 w-10 mx-auto mb-3" />No payouts yet</CardContent></Card>
              ) : (
                <div className="grid gap-3">
                  {payouts.map(payout => (
                    <Card key={payout.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <p className="font-medium">{payout.sellers?.store_name ?? 'Unknown Store'}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                payout.status === 'paid'       ? 'bg-green-100 text-green-700'
                                  : payout.status === 'processing' ? 'bg-blue-100 text-blue-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {payout.status}
                              </span>
                            </div>
                            <p className="text-sm font-semibold">{fmt(payout.net_amount ?? payout.amount)}</p>
                            <p className="text-xs text-muted-foreground">Gross: {fmt(payout.amount)} · Commission: {fmt(payout.commission_amount ?? 0)}</p>
                            {payout.mpesa_phone && <p className="text-xs text-muted-foreground">M-Pesa: {payout.mpesa_phone}</p>}
                            {payout.mpesa_receipt && <p className="text-xs text-green-700 font-mono">Receipt: {payout.mpesa_receipt}</p>}
                            <p className="text-xs text-muted-foreground mt-1">{new Date(payout.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="flex flex-col gap-2 flex-shrink-0">
                            {payout.status === 'pending' && (
                              <Button size="sm" variant="outline" className="text-xs gap-1.5 text-blue-700 border-blue-300 hover:bg-blue-50"
                                disabled={actionLoadingId === payout.id}
                                onClick={() => handlePayoutUpdate(payout.id, 'processing')}>
                                {actionLoadingId === payout.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Clock className="h-3.5 w-3.5" />}
                                Process
                              </Button>
                            )}
                            {payout.status === 'processing' && (
                              <Button size="sm" variant="outline" className="text-xs gap-1.5 text-green-700 border-green-300 hover:bg-green-50"
                                disabled={actionLoadingId === payout.id}
                                onClick={() => {
                                  const receipt = prompt('Enter M-Pesa receipt number:')
                                  if (receipt) handlePayoutUpdate(payout.id, 'paid', receipt)
                                }}>
                                {actionLoadingId === payout.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                                Mark Paid
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── USERS ── */}
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
                    the <code className="bg-muted px-1 rounded">profiles</code> table in Supabase, or approve them via the Sellers tab.
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
