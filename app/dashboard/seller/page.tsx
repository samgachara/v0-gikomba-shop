'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Package, ShoppingBag, TrendingUp, LogOut, Loader2,
  Plus, Trash2, AlertCircle, CheckCircle, X, Pencil,
  DollarSign, BarChart2, Bell, ArrowRight, Banknote,
  Clock, Truck, PackageCheck,
} from 'lucide-react'
import { Button }   from '@/components/ui/button'
import { Input }    from '@/components/ui/input'
import { Label }    from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useAuth }  from '@/lib/auth-context'
import { Header }   from '@/components/header'
import type { Product } from '@/lib/types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SellerOrder {
  id: string
  status: string
  payment_status: string
  total: number
  shipping_address: string
  shipping_city: string
  phone: string
  created_at: string
  items: {
    id: string
    quantity: number
    price: number
    product: { name: string; image_url: string | null } | null
  }[]
}

interface Payout {
  id: string
  amount: number
  net_amount: number
  commission_amount: number
  status: string
  mpesa_receipt: string | null
  period_start: string | null
  period_end: string | null
  created_at: string
}

interface Stats {
  totalSales: number
  pendingOrders: number
  productCount: number
  monthlyRevenue?: number
  avgOrderValue?: number
  totalOrders?: number
}

const CATEGORIES = [
  'Clothing', 'Shoes', 'Accessories', 'Electronics',
  'Home & Living', 'Sports', 'Beauty', 'Books', 'Other',
]

const EMPTY_FORM = {
  name: '', description: '', price: '',
  original_price: '', category: '', stock: '', image_url: '',
}

const LOW_STOCK_THRESHOLD = 5

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) { return `KSh ${n.toLocaleString()}` }

function statusColor(s: string) {
  const m: Record<string, string> = {
    pending:   'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped:   'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }
  return m[s] ?? 'bg-gray-100 text-gray-800'
}

function payoutStatusColor(s: string) {
  const m: Record<string, string> = {
    pending:    'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    paid:       'bg-green-100 text-green-800',
    failed:     'bg-red-100 text-red-800',
  }
  return m[s] ?? 'bg-gray-100 text-gray-800'
}

const NEXT_STATUS: Record<string, { label: string; next: string; icon: React.ReactNode }> = {
  pending:   { label: 'Confirm Order',  next: 'confirmed', icon: <CheckCircle className="h-3.5 w-3.5" /> },
  confirmed: { label: 'Mark Shipped',   next: 'shipped',   icon: <Truck className="h-3.5 w-3.5" /> },
  shipped:   { label: 'Mark Delivered', next: 'delivered', icon: <PackageCheck className="h-3.5 w-3.5" /> },
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SellerDashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()

  const [tab,         setTab]         = useState<'overview' | 'products' | 'orders' | 'earnings'>('overview')
  const [profile,     setProfile]     = useState<{ first_name: string | null } | null>(null)
  const [stats,       setStats]       = useState<Stats | null>(null)
  const [products,    setProducts]    = useState<Product[]>([])
  const [orders,      setOrders]      = useState<SellerOrder[]>([])
  const [payouts,     setPayouts]     = useState<Payout[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)

  const [showForm,   setShowForm]   = useState(false)
  const [form,       setForm]       = useState(EMPTY_FORM)
  const [formError,  setFormError]  = useState<string | null>(null)
  const [formOk,     setFormOk]     = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login')
  }, [user, authLoading, router])

  const loadAll = useCallback(async () => {
    if (!user) return
    setPageLoading(true)
    const [profileRes, statsRes, productsRes, ordersRes, payoutsRes] = await Promise.all([
      fetch('/api/seller/profile'),
      fetch('/api/seller/stats'),
      fetch('/api/seller/products'),
      fetch('/api/seller/orders'),
      fetch('/api/seller/earnings'),
    ])
    if (profileRes.ok)  setProfile(await profileRes.json())
    if (statsRes.ok)    setStats(await statsRes.json())
    if (productsRes.ok) { const d = await productsRes.json(); setProducts(Array.isArray(d) ? d : d.products ?? []) }
    if (ordersRes.ok)   { const d = await ordersRes.json();   setOrders(Array.isArray(d)   ? d : d.orders   ?? []) }
    if (payoutsRes.ok) {
      const d = await payoutsRes.json()
      setPayouts(Array.isArray(d) ? d : d.payouts ?? [])
    }
    setPageLoading(false)
  }, [user])

  useEffect(() => { loadAll() }, [loadAll])

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null); setFormOk(false)
    if (!form.name.trim())       return setFormError('Product name is required')
    if (!form.category)          return setFormError('Please select a category')
    if (!form.price)             return setFormError('Price is required')
    if (Number(form.price) <= 0) return setFormError('Price must be greater than 0')
    if (!form.stock)             return setFormError('Stock quantity is required')
    if (Number(form.stock) < 0)  return setFormError('Stock cannot be negative')
    if (form.original_price && Number(form.original_price) <= Number(form.price))
      return setFormError('Original price must be higher than selling price')

    setSubmitting(true)
    const res = await fetch('/api/seller/products', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setFormError(data.error ?? 'Failed to add product'); setSubmitting(false); return }
    const newProduct = data.product ?? data
    setProducts(prev => [{ ...newProduct, name: newProduct.name ?? newProduct.title }, ...prev])
    setStats(prev => prev ? { ...prev, productCount: prev.productCount + 1 } : prev)
    setForm(EMPTY_FORM); setFormOk(true); setSubmitting(false)
    setTimeout(() => { setFormOk(false); setShowForm(false) }, 1500)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return
    setDeletingId(id)
    const res = await fetch(`/api/seller/products/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setProducts(prev => prev.filter(p => p.id !== id))
      setStats(prev => prev ? { ...prev, productCount: prev.productCount - 1 } : prev)
    }
    setDeletingId(null)
  }

  const handleOrderStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId)
    const res = await fetch(`/api/seller/orders/${orderId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      if (newStatus !== 'pending')
        setStats(prev => prev ? { ...prev, pendingOrders: Math.max(0, (prev.pendingOrders ?? 0) - 1) } : prev)
    }
    setUpdatingOrderId(null)
  }

  const lowStockProducts    = products.filter(p => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD)
  const outOfStockProducts  = products.filter(p => p.stock === 0)
  const totalEarnings       = payouts.filter(p => p.status === 'paid').reduce((s, p) => s + (p.net_amount ?? 0), 0)
  const pendingEarnings     = payouts.filter(p => p.status === 'pending').reduce((s, p) => s + (p.net_amount ?? 0), 0)

  if (authLoading || pageLoading) {
    return (
      <><Header />
        <main className="min-h-screen bg-background py-8">
          <div className="mx-auto max-w-5xl px-4 flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </>
    )
  }
  if (!user) return null

  return (
    <><Header />
      <main className="min-h-screen bg-background py-8">
        <div className="mx-auto max-w-5xl px-4">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Seller Dashboard</h1>
              <p className="text-muted-foreground mt-1">Welcome back, {profile?.first_name ?? 'Seller'}</p>
            </div>
            <Button variant="ghost" className="gap-2 text-destructive hover:text-destructive" onClick={signOut}>
              <LogOut className="h-4 w-4" />Sign Out
            </Button>
          </div>

          {/* Stock alerts */}
          {(outOfStockProducts.length > 0 || lowStockProducts.length > 0) && (
            <div className="mb-6 space-y-2">
              {outOfStockProducts.length > 0 && (
                <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
                  <Bell className="h-4 w-4 flex-shrink-0" />
                  <span>
                    <strong>{outOfStockProducts.length} product{outOfStockProducts.length > 1 ? 's' : ''} out of stock:</strong>{' '}
                    {outOfStockProducts.slice(0, 3).map(p => p.name).join(', ')}
                    {outOfStockProducts.length > 3 && ` +${outOfStockProducts.length - 3} more`}
                  </span>
                  <Button variant="ghost" size="sm" className="ml-auto text-red-700 hover:text-red-900 shrink-0" onClick={() => setTab('products')}>
                    Update stock <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              )}
              {lowStockProducts.length > 0 && (
                <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>
                    <strong>{lowStockProducts.length} item{lowStockProducts.length > 1 ? 's' : ''} running low: </strong>
                    {lowStockProducts.map(p => `${p.name} (${p.stock} left)`).slice(0, 3).join(', ')}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 mb-8 border-b border-border overflow-x-auto">
            {(['overview', 'products', 'orders', 'earnings'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px whitespace-nowrap ${
                  tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}>
                {t}
                {t === 'orders' && stats && stats.pendingOrders > 0 && (
                  <span className="ml-2 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                    {stats.pendingOrders}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW ── */}
          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: 'Total Sales',     value: stats ? fmt(stats.totalSales) : '—',    icon: TrendingUp, sub: 'From completed orders' },
                  { label: 'Products Listed', value: stats?.productCount ?? '—',              icon: Package,    sub: stats?.productCount === 0 ? 'Add your first product' : 'Active listings' },
                  { label: 'Pending Orders',  value: stats?.pendingOrders ?? '—',             icon: ShoppingBag, sub: stats?.pendingOrders === 0 ? 'All caught up' : 'Need attention' },
                  { label: 'Avg Order Value', value: stats?.avgOrderValue ? fmt(Math.round(stats.avgOrderValue)) : stats?.totalSales && stats?.totalOrders ? fmt(Math.round(stats.totalSales / stats.totalOrders)) : '—', icon: BarChart2, sub: 'Per completed order' },
                ].map(({ label, value, icon: Icon, sub }) => (
                  <Card key={label}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><Banknote className="h-4 w-4" />Earnings Summary</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Paid Out</span>
                      <span className="font-semibold text-green-600">{fmt(totalEarnings)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Pending Payout</span>
                      <span className="font-semibold text-yellow-600">{fmt(pendingEarnings)}</span>
                    </div>
                    <Separator />
                    <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => setTab('earnings')}>
                      <DollarSign className="h-3.5 w-3.5" />View Earnings
                    </Button>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-base font-semibold">Recent Orders</h2>
                      <Button variant="outline" size="sm" onClick={() => setTab('orders')}>View all</Button>
                    </div>
                    {orders.length === 0 ? (
                      <p className="text-muted-foreground text-sm py-6 text-center">No orders yet</p>
                    ) : (
                      <div className="space-y-3">
                        {orders.slice(0, 4).map(order => (
                          <div key={order.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div>
                              <p className="text-sm font-medium">Order #{order.id.slice(0, 8)}</p>
                              <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()} · {order.shipping_city}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{fmt(order.total)}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(order.status)}`}>{order.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* ── PRODUCTS ── */}
          {tab === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Your Products</h2>
                <Button onClick={() => { setShowForm(true); setFormError(null); setFormOk(false) }} className="gap-2">
                  <Plus className="h-4 w-4" />Add Product
                </Button>
              </div>

              {showForm && (
                <Card className="border-primary/30">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base">New Product</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddProduct} className="space-y-4">
                      {formError && <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm"><AlertCircle className="h-4 w-4 flex-shrink-0" />{formError}</div>}
                      {formOk && <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg text-sm"><CheckCircle className="h-4 w-4 flex-shrink-0" />Product added successfully!</div>}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 space-y-2">
                          <Label htmlFor="name">Product Name *</Label>
                          <Input id="name" placeholder="e.g. Vintage Denim Jacket" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea id="description" placeholder="Describe your product..." rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Category *</Label>
                          <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                            <SelectTrigger id="category"><SelectValue placeholder="Select category" /></SelectTrigger>
                            <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="stock">Stock Quantity *</Label>
                          <Input id="stock" type="number" min="0" placeholder="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="price">Selling Price (KSh) *</Label>
                          <Input id="price" type="number" min="0" step="0.01" placeholder="0.00" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="original_price">Original Price (KSh) <span className="text-muted-foreground text-xs">optional</span></Label>
                          <Input id="original_price" type="number" min="0" step="0.01" placeholder="Shows as crossed-out price" value={form.original_price} onChange={e => setForm(f => ({ ...f, original_price: e.target.value }))} />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <Label>Product Image <span className="text-muted-foreground text-xs">optional</span></Label>
                          <div className="flex items-center gap-3 mb-1">
                            <input type="file" accept="image/*" id="dash-img-upload" className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (!file) return
                                const fd = new FormData()
                                fd.append('file', file)
                                const res = await fetch('/api/upload', { method: 'POST', body: fd })
                                const data = await res.json()
                                if (res.ok) setForm(f => ({ ...f, image_url: data.url }))
                                else setFormError(data.error ?? 'Upload failed')
                              }}
                            />
                            <label htmlFor="dash-img-upload" className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent transition-colors">
                              📁 Upload
                            </label>
                            {form.image_url && <img src={form.image_url} alt="Preview" className="h-9 w-9 rounded object-cover border flex-shrink-0" />}
                          </div>
                          <Input id="image_url" type="url" placeholder="or paste URL: https://i.imgur.com/..." value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} />
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <Button type="submit" disabled={submitting} className="gap-2">
                          {submitting ? <><Loader2 className="h-4 w-4 animate-spin" />Adding...</> : <><Plus className="h-4 w-4" />Add Product</>}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {products.length === 0 ? (
                <Card><CardContent className="py-16 text-center"><Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="font-medium">No products yet</p><p className="text-sm text-muted-foreground mt-1">Click "Add Product" to list your first item</p></CardContent></Card>
              ) : (
                <div className="grid gap-3">
                  {products.map(product => (
                    <Card key={product.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                            {product.image_url
                              ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center"><Package className="h-6 w-6 text-muted-foreground" /></div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.category}</p>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              <span className="text-sm font-semibold">{fmt(product.price)}</span>
                              {product.original_price && <span className="text-xs text-muted-foreground line-through">{fmt(product.original_price)}</span>}
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                product.stock === 0 ? 'bg-red-100 text-red-700'
                                  : product.stock <= LOW_STOCK_THRESHOLD ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {product.stock === 0 ? 'Out of stock' : `${product.stock} in stock`}
                                {product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD && ' ⚠ Low'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" asChild>
                              <Link href={`/seller/products/${product.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(product.id)} disabled={deletingId === product.id}>
                              {deletingId === product.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── ORDERS ── */}
          {tab === 'orders' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Orders for Your Products</h2>
              {orders.length === 0 ? (
                <Card><CardContent className="py-16 text-center"><ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="font-medium">No orders yet</p><p className="text-sm text-muted-foreground mt-1">Orders will appear here when customers buy your products</p></CardContent></Card>
              ) : (
                <div className="grid gap-4">
                  {orders.map(order => {
                    const nextAction = NEXT_STATUS[order.status]
                    return (
                      <Card key={order.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                              <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{fmt(order.total)}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(order.status)}`}>{order.status}</span>
                            </div>
                          </div>
                          <div className="space-y-2 mb-3">
                            {order.items.map(item => (
                              <div key={item.id} className="flex justify-between text-sm bg-muted/30 rounded px-3 py-2">
                                <span>{item.product?.name ?? 'Unknown product'} × {item.quantity}</span>
                                <span className="font-medium">{fmt(item.price * item.quantity)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="text-xs text-muted-foreground border-t pt-3 mb-3">
                            <span className="font-medium">Deliver to:</span> {order.shipping_address}, {order.shipping_city} · {order.phone}
                          </div>
                          {nextAction && order.payment_status === 'completed' && (
                            <Button size="sm" variant="outline" className="gap-2 text-xs" disabled={updatingOrderId === order.id} onClick={() => handleOrderStatusUpdate(order.id, nextAction.next)}>
                              {updatingOrderId === order.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : nextAction.icon}
                              {nextAction.label}
                            </Button>
                          )}
                          {nextAction && order.payment_status !== 'completed' && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />Waiting for payment before fulfilling</p>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── EARNINGS ── */}
          {tab === 'earnings' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Earnings &amp; Payouts</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground mb-1">Total Earned</p><p className="text-2xl font-bold text-green-600">{fmt(totalEarnings)}</p><p className="text-xs text-muted-foreground mt-1">After commission</p></CardContent></Card>
                <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground mb-1">Pending Payout</p><p className="text-2xl font-bold text-yellow-600">{fmt(pendingEarnings)}</p><p className="text-xs text-muted-foreground mt-1">Being processed</p></CardContent></Card>
                <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground mb-1">Payout Records</p><p className="text-2xl font-bold">{payouts.length}</p><p className="text-xs text-muted-foreground mt-1">All time</p></CardContent></Card>
              </div>
              {payouts.length === 0 ? (
                <Card><CardContent className="py-16 text-center"><Banknote className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="font-medium">No payout records yet</p><p className="text-sm text-muted-foreground mt-1">Payouts appear once orders complete and admin processes them</p></CardContent></Card>
              ) : (
                <div className="grid gap-3">
                  {payouts.map(payout => (
                    <Card key={payout.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">{fmt(payout.net_amount ?? payout.amount)}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${payoutStatusColor(payout.status)}`}>{payout.status}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Gross: {fmt(payout.amount)} · Commission: {fmt(payout.commission_amount ?? 0)}</p>
                            {payout.period_start && payout.period_end && (
                              <p className="text-xs text-muted-foreground">Period: {new Date(payout.period_start).toLocaleDateString()} – {new Date(payout.period_end).toLocaleDateString()}</p>
                            )}
                            {payout.mpesa_receipt && <p className="text-xs text-green-700 font-mono mt-1">M-Pesa: {payout.mpesa_receipt}</p>}
                          </div>
                          <p className="text-xs text-muted-foreground text-right">{new Date(payout.created_at).toLocaleDateString()}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              <Card className="bg-muted/30">
                <CardContent className="p-4 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">How payouts work</p>
                  <p>Earnings from delivered orders are calculated weekly after deducting platform commission. Payouts are sent via M-Pesa. Contact support if a payout is overdue.</p>
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </main>
    </>
  )
}
