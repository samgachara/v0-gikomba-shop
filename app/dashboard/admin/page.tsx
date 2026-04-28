'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users, Package, ShoppingBag, TrendingUp, Loader2, RefreshCw,
  DollarSign, AlertCircle, CheckCircle, Clock, XCircle, BarChart2,
  Store, Banknote, UserCheck, UserX, ShieldCheck, Star, Trash2,
  MessageSquare, ToggleLeft, ToggleRight, Search, Crown, Eye,
  ChevronDown, Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/lib/auth-context'
import { Header } from '@/components/header'
import { toast } from 'sonner'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminStats {
  totalUsers: number; totalProducts: number; totalOrders: number
  pendingOrders: number; totalRevenue: number
  roleBreakdown: Record<string, number>
  recentOrders: any[]; topProducts: any[]
}
interface Seller { id: string; store_name: string; status: string; verified: boolean; created_at: string; profiles?: any }
interface Payout { id: string; seller_id: string; amount: number; net_amount: number; commission_amount: number; status: string; mpesa_phone: string | null; mpesa_receipt: string | null; created_at: string; sellers?: any }
interface User { id: string; first_name: string | null; last_name: string | null; phone: string | null; role: string; created_at: string }
interface Order { id: string; total: number; status: string; payment_status: string; payment_method: string; shipping_city: string; phone: string; created_at: string; buyer?: any; seller?: any; order_items?: any[] }
interface Product { id: string; name: string; price: number; category: string; stock: number; is_active: boolean; is_featured: boolean; is_new: boolean; image_url: string | null; num_reviews: number; created_at: string; seller?: any }
interface Review { id: string; rating: number; comment: string; created_at: string; product?: any; reviewer?: any }
interface SupportTicket { id: string; name: string; email: string; subject: string; message: string; created_at: string }

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => `KSh ${n.toLocaleString()}`

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800', confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800', delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800', completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800', processing: 'bg-indigo-100 text-indigo-800',
  active: 'bg-green-100 text-green-700', suspended: 'bg-red-100 text-red-700',
  paid: 'bg-green-100 text-green-700', refunded: 'bg-gray-100 text-gray-700',
}
const pill = (s: string) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[s] ?? 'bg-gray-100 text-gray-700'}`}>{s}</span>
)
const TABS = ['overview','orders','products','sellers','users','payouts','reviews','support'] as const
type Tab = typeof TABS[number]

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [tab,       setTab]       = useState<Tab>('overview')
  const [stats,     setStats]     = useState<AdminStats | null>(null)
  const [sellers,   setSellers]   = useState<Seller[]>([])
  const [payouts,   setPayouts]   = useState<Payout[]>([])
  const [users,     setUsers]     = useState<User[]>([])
  const [orders,    setOrders]    = useState<Order[]>([])
  const [products,  setProducts]  = useState<Product[]>([])
  const [reviews,   setReviews]   = useState<Review[]>([])
  const [tickets,   setTickets]   = useState<SupportTicket[]>([])
  const [loading,   setLoading]   = useState(true)
  const [forbidden, setForbidden] = useState(false)
  const [actionId,  setActionId]  = useState<string | null>(null)

  // Filters
  const [orderFilter,   setOrderFilter]   = useState('')
  const [productFilter, setProductFilter] = useState('')
  const [userSearch,    setUserSearch]    = useState('')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [expandedTicket,setExpandedTicket]= useState<string | null>(null)

  useEffect(() => { if (!authLoading && !user) router.push('/auth/login') }, [user, authLoading, router])

  const loadAll = useCallback(async () => {
    setLoading(true)
    const [statsRes, sellersRes, payoutsRes] = await Promise.all([
      fetch('/api/admin/stats'),
      fetch('/api/admin/sellers'),
      fetch('/api/admin/payouts'),
    ])
    if (statsRes.status === 403) { setForbidden(true); setLoading(false); return }
    if (statsRes.ok)   setStats(await statsRes.json())
    if (sellersRes.ok) { const d = await sellersRes.json(); setSellers(Array.isArray(d) ? d : d.sellers ?? []) }
    if (payoutsRes.ok) { const d = await payoutsRes.json(); setPayouts(Array.isArray(d) ? d : d.payouts ?? []) }
    setLoading(false)
  }, [])

  const loadTab = useCallback(async (t: Tab) => {
    if (t === 'users'    && users.length    === 0) { const r = await fetch('/api/admin/users');    if (r.ok) { const d = await r.json(); setUsers(d.users ?? []) } }
    if (t === 'orders'   && orders.length   === 0) { const r = await fetch('/api/admin/orders');   if (r.ok) { const d = await r.json(); setOrders(d.orders ?? []) } }
    if (t === 'products' && products.length === 0) { const r = await fetch('/api/admin/products'); if (r.ok) { const d = await r.json(); setProducts(d.products ?? []) } }
    if (t === 'reviews'  && reviews.length  === 0) { const r = await fetch('/api/admin/reviews');  if (r.ok) setReviews(await r.json()) }
    if (t === 'support'  && tickets.length  === 0) { const r = await fetch('/api/admin/support');  if (r.ok) setTickets(await r.json()) }
  }, [users.length, orders.length, products.length, reviews.length, tickets.length])

  useEffect(() => { if (user) loadAll() }, [user, loadAll])
  useEffect(() => { loadTab(tab) }, [tab, loadTab])

  // ── Actions ──────────────────────────────────────────────────────────────────
  const sellerAction = async (id: string, status: string, verified?: boolean) => {
    setActionId(id)
    const r = await fetch('/api/admin/sellers', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ seller_id: id, status, verified }) })
    if (r.ok) setSellers(p => p.map(s => s.id === id ? { ...s, status, verified: verified ?? s.verified } : s))
    setActionId(null)
  }

  const userRoleAction = async (id: string, role: string) => {
    setActionId(id)
    const r = await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: id, role }) })
    if (r.ok) setUsers(p => p.map(u => u.id === id ? { ...u, role } : u))
    setActionId(null)
  }

  const orderAction = async (id: string, status?: string, payment_status?: string) => {
    setActionId(id)
    const r = await fetch('/api/admin/orders', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_id: id, status, payment_status }) })
    if (r.ok) setOrders(p => p.map(o => o.id === id ? { ...o, ...(status && { status }), ...(payment_status && { payment_status }) } : o))
    setActionId(null)
  }

  const productAction = async (id: string, updates: any) => {
    setActionId(id)
    const r = await fetch('/api/admin/products', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: id, ...updates }) })
    if (r.ok) {
      setProducts(p => p.map(pr => pr.id === id ? { ...pr, ...updates } : pr))
    } else {
      const payload = await r.json().catch(() => null)
      toast.error(payload?.error ?? 'Failed to update product')
    }
    setActionId(null)
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product? Products with past orders will be archived instead of permanently removed.')) return
    setActionId(id)
    const r = await fetch('/api/admin/products', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: id }) })
    const payload = await r.json().catch(() => null)
    if (r.ok) {
      setProducts(p => p.filter(pr => pr.id !== id))
      toast.success(payload?.message ?? 'Product removed')
    } else {
      toast.error(payload?.error ?? 'Failed to delete product')
    }
    setActionId(null)
  }

  const deleteReview = async (id: string) => {
    if (!confirm('Delete this review?')) return
    setActionId(id)
    const r = await fetch('/api/admin/reviews', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ review_id: id }) })
    if (r.ok) setReviews(p => p.filter(rv => rv.id !== id))
    setActionId(null)
  }

  const payoutAction = async (id: string, status: string, receipt?: string) => {
    setActionId(id)
    const r = await fetch('/api/admin/payouts', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ payout_id: id, status, mpesa_receipt: receipt }) })
    if (r.ok) setPayouts(p => p.map(pt => pt.id === id ? { ...pt, status } : pt))
    setActionId(null)
  }

  // ── Guard ─────────────────────────────────────────────────────────────────────
  if (authLoading || loading) return (
    <><Header /><main className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></main></>
  )
  if (forbidden) return (
    <><Header /><main className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center"><AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" /><h1 className="text-2xl font-bold mb-2">Access Denied</h1><p className="text-muted-foreground">Admin privileges required.</p></div>
    </main></>
  )

  // ── Derived ────────────────────────────────────────────────────────────────────
  const pendingSellers = sellers.filter(s => s.status === 'pending' || (!s.verified && s.status === 'active'))
  const pendingPayouts = payouts.filter(p => p.status === 'pending')
  const pendingOrders  = orders.filter(o => o.status === 'pending')

  const filteredOrders   = orders.filter(o => !orderFilter   || o.status === orderFilter)
  const filteredProducts = products.filter(p => !productFilter || p.category === productFilter || (productFilter === 'inactive' && !p.is_active) || (productFilter === 'featured' && p.is_featured))
  const filteredUsers    = users.filter(u => !userSearch || `${u.first_name} ${u.last_name}`.toLowerCase().includes(userSearch.toLowerCase()))

  const kpis = [
    { label: 'Total Users',     value: stats?.totalUsers ?? 0,           icon: Users,       bg: 'bg-blue-100',   ic: 'text-blue-600' },
    { label: 'Active Products', value: stats?.totalProducts ?? 0,        icon: Package,     bg: 'bg-purple-100', ic: 'text-purple-600' },
    { label: 'Total Orders',    value: stats?.totalOrders ?? 0,          icon: ShoppingBag, bg: 'bg-orange-100', ic: 'text-orange-600' },
    { label: 'Total Revenue',   value: fmt(stats?.totalRevenue ?? 0),    icon: DollarSign,  bg: 'bg-green-100',  ic: 'text-green-600' },
  ]

  const CATEGORIES = ['Clothing','Shoes','Accessories','Electronics','Home & Living','Sports','Beauty','Books','Other']

  return (
    <><Header />
      <main className="min-h-screen bg-background py-8">
        <div className="mx-auto max-w-6xl px-4">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2"><Crown className="h-7 w-7 text-primary" />Admin Panel</h1>
              <p className="text-muted-foreground mt-1">Full platform control</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => { loadAll(); setOrders([]); setUsers([]); setProducts([]); setReviews([]); setTickets([]); setTimeout(() => loadTab(tab), 300) }}>
              <RefreshCw className="h-4 w-4" />Refresh
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-8 border-b overflow-x-auto">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px whitespace-nowrap ${tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                {t}
                {t === 'orders'  && (stats?.pendingOrders ?? 0) > 0   && <span className="ml-1.5 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">{stats!.pendingOrders}</span>}
                {t === 'sellers' && pendingSellers.length > 0          && <span className="ml-1.5 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingSellers.length}</span>}
                {t === 'payouts' && pendingPayouts.length > 0          && <span className="ml-1.5 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingPayouts.length}</span>}
                {t === 'support' && tickets.length > 0                 && <span className="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{tickets.length}</span>}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW ── */}
          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {kpis.map(({ label, value, icon: Icon, bg, ic }) => (
                  <Card key={label}><CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-muted-foreground">{label}</span>
                      <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}><Icon className={`h-5 w-5 ${ic}`} /></div>
                    </div>
                    <p className="text-2xl font-bold">{value}</p>
                  </CardContent></Card>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Card className="md:col-span-2">
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart2 className="h-4 w-4" />Platform Summary</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { label: 'Completed Revenue',  value: fmt(stats?.totalRevenue ?? 0),            cls: 'text-green-600',  icon: CheckCircle },
                      { label: 'Pending Orders',     value: `${stats?.pendingOrders ?? 0} orders`,    cls: 'text-yellow-600', icon: Clock },
                      { label: 'Avg Order Value',    value: stats && stats.totalOrders > 0 ? fmt(Math.round(stats.totalRevenue / stats.totalOrders)) : 'KSh 0', cls: 'text-blue-600', icon: TrendingUp },
                      { label: 'Active Sellers',     value: `${sellers.filter(s=>s.status==='active').length} of ${sellers.length}`, cls: 'text-indigo-600', icon: Store },
                      { label: 'Unverified Sellers', value: `${sellers.filter(s=>!s.verified).length} need review`,             cls: 'text-orange-600', icon: AlertCircle },
                      { label: 'Support Tickets',    value: `${tickets.length} open`,                                            cls: 'text-red-600',    icon: MessageSquare },
                    ].map(({ label, value, cls, icon: Icon }) => (
                      <div key={label} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3"><Icon className={`h-4 w-4 ${cls}`} /><span className="text-sm">{label}</span></div>
                        <span className="text-sm font-semibold">{value}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" />User Breakdown</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {(['buyer','seller','admin'] as const).map(role => {
                      const count = stats?.roleBreakdown[role] ?? 0
                      const total = stats?.totalUsers || 1
                      const pct = Math.round((count / total) * 100)
                      const colors: Record<string,string> = { buyer: 'bg-blue-500', seller: 'bg-purple-500', admin: 'bg-red-500' }
                      return (
                        <div key={role}>
                          <div className="flex justify-between text-sm mb-1"><span className="capitalize">{role}s</span><span className="font-medium">{count} ({pct}%)</span></div>
                          <div className="h-2 bg-muted rounded-full"><div className={`h-full ${colors[role]} rounded-full`} style={{ width: `${pct}%` }} /></div>
                        </div>
                      )
                    })}
                    <Separator />
                    <div className="flex justify-between text-sm font-semibold"><span>Total</span><span>{stats?.totalUsers ?? 0}</span></div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* ── ORDERS ── */}
          {tab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-xl font-semibold">All Orders</h2>
                <div className="flex gap-2 flex-wrap">
                  {['','pending','confirmed','shipped','delivered','cancelled'].map(s => (
                    <button key={s} onClick={() => setOrderFilter(s)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${orderFilter === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}>
                      {s || 'All'}
                    </button>
                  ))}
                </div>
              </div>
              {filteredOrders.length === 0
                ? <Card><CardContent className="py-16 text-center text-muted-foreground"><ShoppingBag className="h-10 w-10 mx-auto mb-3 opacity-50" />{orders.length === 0 ? 'Loading orders...' : 'No orders match filter'}</CardContent></Card>
                : filteredOrders.map(order => (
                  <Card key={order.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <p className="font-medium font-mono text-sm">#{order.id.slice(0,8).toUpperCase()}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(order.created_at).toLocaleString('en-KE')} · {order.shipping_city} · {order.phone}
                          </p>
                          {order.buyer && <p className="text-xs text-muted-foreground">{order.buyer.first_name} {order.buyer.last_name}</p>}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {pill(order.status)} {pill(order.payment_status)}
                          <span className="font-semibold text-sm">{fmt(order.total)}</span>
                          <button onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)} className="text-muted-foreground hover:text-foreground">
                            <ChevronDown className={`h-4 w-4 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                      </div>
                      {expandedOrder === order.id && (
                        <div className="mt-4 border-t pt-4 space-y-3">
                          {(order.order_items ?? []).map((item: any, i: number) => (
                            <div key={i} className="flex justify-between text-sm bg-muted/30 rounded px-3 py-2">
                              <span>{item.product?.name ?? 'Product'} × {item.quantity}</span>
                              <span>{fmt(item.price * item.quantity)}</span>
                            </div>
                          ))}
                          <div className="flex gap-2 flex-wrap pt-2">
                            {order.status === 'pending'   && <Button size="sm" variant="outline" className="text-xs gap-1 text-blue-700 border-blue-300" disabled={actionId===order.id} onClick={() => orderAction(order.id,'confirmed')}>{actionId===order.id?<Loader2 className="h-3 w-3 animate-spin"/>:<CheckCircle className="h-3 w-3"/>}Confirm</Button>}
                            {order.status === 'confirmed' && <Button size="sm" variant="outline" className="text-xs gap-1 text-purple-700 border-purple-300" disabled={actionId===order.id} onClick={() => orderAction(order.id,'shipped')}>{actionId===order.id?<Loader2 className="h-3 w-3 animate-spin"/>:<Package className="h-3 w-3"/>}Ship</Button>}
                            {order.status === 'shipped'   && <Button size="sm" variant="outline" className="text-xs gap-1 text-green-700 border-green-300" disabled={actionId===order.id} onClick={() => orderAction(order.id,'delivered')}>{actionId===order.id?<Loader2 className="h-3 w-3 animate-spin"/>:<CheckCircle className="h-3 w-3"/>}Delivered</Button>}
                            {order.status !== 'cancelled' && order.status !== 'delivered' && <Button size="sm" variant="outline" className="text-xs gap-1 text-red-700 border-red-300" disabled={actionId===order.id} onClick={() => orderAction(order.id,'cancelled')}><XCircle className="h-3 w-3"/>Cancel</Button>}
                            {order.payment_status === 'pending' && <Button size="sm" variant="outline" className="text-xs gap-1 text-green-700 border-green-300" disabled={actionId===order.id} onClick={() => orderAction(order.id,undefined,'completed')}><DollarSign className="h-3 w-3"/>Mark Paid</Button>}
                            {order.payment_status === 'completed' && <Button size="sm" variant="outline" className="text-xs gap-1 text-gray-700 border-gray-300" disabled={actionId===order.id} onClick={() => orderAction(order.id,undefined,'refunded')}><XCircle className="h-3 w-3"/>Refund</Button>}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              }
            </div>
          )}

          {/* ── PRODUCTS ── */}
          {tab === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-xl font-semibold">All Products</h2>
                <div className="flex gap-2 flex-wrap">
                  {['','featured','inactive',...CATEGORIES].map(f => (
                    <button key={f} onClick={() => setProductFilter(f)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${productFilter === f ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}>
                      {f || 'All'}
                    </button>
                  ))}
                </div>
              </div>
              {filteredProducts.length === 0
                ? <Card><CardContent className="py-16 text-center text-muted-foreground"><Package className="h-10 w-10 mx-auto mb-3 opacity-50" />{products.length === 0 ? 'Loading products...' : 'No products match filter'}</CardContent></Card>
                : filteredProducts.map(product => (
                  <Card key={product.id} className={!product.is_active ? 'opacity-60' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                          {product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" /> : <Package className="h-5 w-5 m-3.5 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-sm">{product.name}</p>
                            {product.is_featured && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 rounded">★ Featured</span>}
                            {!product.is_active  && <span className="text-xs bg-red-100 text-red-700 px-1.5 rounded">Inactive</span>}
                            {product.is_new      && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 rounded">New</span>}
                          </div>
                          <p className="text-xs text-muted-foreground">{product.seller?.store_name} · {product.category} · {product.stock} stock · {product.num_reviews ?? 0} reviews</p>
                          <p className="text-sm font-semibold mt-0.5">{fmt(product.price)}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0 flex-wrap justify-end">
                          <Button size="sm" variant="ghost" className="text-xs h-8 gap-1" title={product.is_active ? 'Deactivate' : 'Activate'} disabled={actionId===product.id} onClick={() => productAction(product.id, { is_active: !product.is_active })}>
                            {actionId===product.id ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : product.is_active ? <ToggleRight className="h-4 w-4 text-green-600"/> : <ToggleLeft className="h-4 w-4 text-gray-400"/>}
                          </Button>
                          <Button size="sm" variant="ghost" className="text-xs h-8 gap-1" title={product.is_featured ? 'Unfeature' : 'Feature'} disabled={actionId===product.id} onClick={() => productAction(product.id, { is_featured: !product.is_featured })}>
                            <Star className={`h-4 w-4 ${product.is_featured ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-xs h-8 text-destructive hover:text-destructive" disabled={actionId===product.id} onClick={() => deleteProduct(product.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              }
            </div>
          )}

          {/* ── SELLERS ── */}
          {tab === 'sellers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-xl font-semibold">Seller Management</h2>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full" />Active: {sellers.filter(s=>s.status==='active').length}</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-yellow-500 rounded-full" />Pending: {sellers.filter(s=>s.status==='pending').length}</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full" />Suspended: {sellers.filter(s=>s.status==='suspended').length}</span>
                </div>
              </div>
              {sellers.length === 0
                ? <Card><CardContent className="py-16 text-center text-muted-foreground"><Store className="h-10 w-10 mx-auto mb-3 opacity-50" />No sellers yet</CardContent></Card>
                : sellers.map(seller => (
                  <Card key={seller.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="font-medium">{seller.store_name}</p>
                            {seller.verified && <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full"><ShieldCheck className="h-3 w-3"/>Verified</span>}
                            {pill(seller.status)}
                          </div>
                          {seller.profiles && <p className="text-sm text-muted-foreground">{[seller.profiles.first_name,seller.profiles.last_name].filter(Boolean).join(' ')}{seller.profiles.phone && ` · ${seller.profiles.phone}`}</p>}
                          <p className="text-xs text-muted-foreground mt-1">Joined {new Date(seller.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {seller.status !== 'active'  && <Button size="sm" variant="outline" className="text-xs gap-1 text-green-700 border-green-300 hover:bg-green-50" disabled={actionId===seller.id} onClick={() => sellerAction(seller.id,'active')}>{actionId===seller.id?<Loader2 className="h-3 w-3 animate-spin"/>:<UserCheck className="h-3 w-3"/>}Approve</Button>}
                          {!seller.verified && seller.status==='active' && <Button size="sm" variant="outline" className="text-xs gap-1 text-blue-700 border-blue-300 hover:bg-blue-50" disabled={actionId===seller.id} onClick={() => sellerAction(seller.id,'active',true)}>{actionId===seller.id?<Loader2 className="h-3 w-3 animate-spin"/>:<ShieldCheck className="h-3 w-3"/>}Verify</Button>}
                          {seller.status === 'active'  && <Button size="sm" variant="outline" className="text-xs gap-1 text-red-700 border-red-300 hover:bg-red-50" disabled={actionId===seller.id} onClick={() => sellerAction(seller.id,'suspended')}>{actionId===seller.id?<Loader2 className="h-3 w-3 animate-spin"/>:<UserX className="h-3 w-3"/>}Suspend</Button>}
                          {seller.status === 'suspended' && <Button size="sm" variant="outline" className="text-xs gap-1 text-green-700 border-green-300 hover:bg-green-50" disabled={actionId===seller.id} onClick={() => sellerAction(seller.id,'active')}>{actionId===seller.id?<Loader2 className="h-3 w-3 animate-spin"/>:<UserCheck className="h-3 w-3"/>}Reinstate</Button>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              }
            </div>
          )}

          {/* ── USERS ── */}
          {tab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-xl font-semibold">User Management</h2>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search users..." className="pl-9 h-9" value={userSearch} onChange={e => setUserSearch(e.target.value)} />
                </div>
              </div>
              {filteredUsers.length === 0
                ? <Card><CardContent className="py-16 text-center text-muted-foreground"><Users className="h-10 w-10 mx-auto mb-3 opacity-50" />{users.length === 0 ? 'Loading users...' : 'No users match search'}</CardContent></Card>
                : filteredUsers.map(u => (
                  <Card key={u.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center flex-shrink-0">
                              {(u.first_name?.[0] ?? '?').toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{u.first_name} {u.last_name}</p>
                              <p className="text-xs text-muted-foreground">{u.phone ?? 'No phone'} · Joined {new Date(u.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {pill(u.role)}
                          <select
                            className="text-xs border border-border rounded px-2 py-1 bg-background"
                            value={u.role}
                            disabled={actionId === u.id}
                            onChange={e => userRoleAction(u.id, e.target.value)}
                          >
                            <option value="buyer">buyer</option>
                            <option value="seller">seller</option>
                            <option value="admin">admin</option>
                          </select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              }
            </div>
          )}

          {/* ── PAYOUTS ── */}
          {tab === 'payouts' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Payout Management</h2>
              <div className="grid gap-4 sm:grid-cols-3 mb-2">
                {[['pending','text-yellow-600'],['processing','text-blue-600'],['paid','text-green-600']].map(([s,cls]) => (
                  <Card key={s}><CardContent className="p-4"><p className={`text-2xl font-bold ${cls}`}>{payouts.filter(p=>p.status===s).length}</p><p className="text-sm text-muted-foreground capitalize">{s}</p></CardContent></Card>
                ))}
              </div>
              {payouts.length === 0
                ? <Card><CardContent className="py-16 text-center text-muted-foreground"><Banknote className="h-10 w-10 mx-auto mb-3 opacity-50" />No payouts yet</CardContent></Card>
                : payouts.map(payout => (
                  <Card key={payout.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2 mb-1"><p className="font-medium">{payout.sellers?.store_name ?? 'Unknown'}</p>{pill(payout.status)}</div>
                          <p className="text-sm font-semibold">{fmt(payout.net_amount ?? payout.amount)}</p>
                          <p className="text-xs text-muted-foreground">Gross: {fmt(payout.amount)} · Commission: {fmt(payout.commission_amount ?? 0)}</p>
                          {payout.mpesa_phone   && <p className="text-xs text-muted-foreground">M-Pesa: {payout.mpesa_phone}</p>}
                          {payout.mpesa_receipt && <p className="text-xs text-green-700 font-mono">Receipt: {payout.mpesa_receipt}</p>}
                        </div>
                        <div className="flex flex-col gap-2">
                          {payout.status === 'pending' && <Button size="sm" variant="outline" className="text-xs gap-1 text-blue-700 border-blue-300 hover:bg-blue-50" disabled={actionId===payout.id} onClick={() => payoutAction(payout.id,'processing')}>{actionId===payout.id?<Loader2 className="h-3 w-3 animate-spin"/>:<Clock className="h-3 w-3"/>}Process</Button>}
                          {payout.status === 'processing' && <Button size="sm" variant="outline" className="text-xs gap-1 text-green-700 border-green-300 hover:bg-green-50" disabled={actionId===payout.id} onClick={() => { const r=prompt('M-Pesa receipt:'); if(r) payoutAction(payout.id,'paid',r) }}>{actionId===payout.id?<Loader2 className="h-3 w-3 animate-spin"/>:<CheckCircle className="h-3 w-3"/>}Mark Paid</Button>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              }
            </div>
          )}

          {/* ── REVIEWS ── */}
          {tab === 'reviews' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Review Moderation</h2>
              {reviews.length === 0
                ? <Card><CardContent className="py-16 text-center text-muted-foreground"><Star className="h-10 w-10 mx-auto mb-3 opacity-50" />No reviews yet</CardContent></Card>
                : reviews.map(review => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-medium text-sm">{review.product?.name ?? 'Product'}</span>
                            <div className="flex gap-0.5">{[...Array(5)].map((_,i) => <Star key={i} className={`h-3 w-3 ${i<review.rating?'fill-yellow-400 text-yellow-400':'text-muted'}`}/>)}</div>
                          </div>
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            by {review.reviewer?.first_name} {review.reviewer?.last_name} · {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive flex-shrink-0" disabled={actionId===review.id} onClick={() => deleteReview(review.id)}>
                          {actionId===review.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4"/>}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              }
            </div>
          )}

          {/* ── SUPPORT ── */}
          {tab === 'support' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Support Tickets</h2>
              {tickets.length === 0
                ? <Card><CardContent className="py-16 text-center text-muted-foreground"><MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-50" />No support tickets yet</CardContent></Card>
                : tickets.map(ticket => (
                  <Card key={ticket.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="font-medium text-sm">{ticket.subject}</p>
                            <span className="text-xs bg-muted px-2 py-0.5 rounded">{ticket.name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{ticket.email} · {new Date(ticket.created_at).toLocaleString()}</p>
                          {expandedTicket === ticket.id && <p className="text-sm mt-3 p-3 bg-muted/50 rounded-lg">{ticket.message}</p>}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => setExpandedTicket(expandedTicket===ticket.id ? null : ticket.id)}>
                            <Eye className="h-3 w-3"/>{expandedTicket===ticket.id ? 'Collapse' : 'View'}
                          </Button>
                          <a href={`mailto:${ticket.email}?subject=Re: ${ticket.subject}`} className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md border border-border hover:bg-muted transition-colors">
                            Reply
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              }
            </div>
          )}

        </div>
      </main>
    </>
  )
}
