'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Package, ShoppingBag, TrendingUp, LogOut, Loader2,
  Plus, Trash2, AlertCircle, CheckCircle, X,
} from 'lucide-react'
import { Button }   from '@/components/ui/button'
import { Input }    from '@/components/ui/input'
import { Label }    from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

interface Stats {
  totalSales: number
  pendingOrders: number
  productCount: number
}

const CATEGORIES = [
  'Clothing', 'Shoes', 'Accessories', 'Electronics',
  'Home & Living', 'Sports', 'Beauty', 'Books', 'Other',
]

const EMPTY_FORM = {
  name: '', description: '', price: '',
  original_price: '', category: '', stock: '', image_url: '',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return `KSh ${n.toLocaleString()}`
}

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

// ─── Component ────────────────────────────────────────────────────────────────

export default function SellerDashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()

  const [tab,        setTab]        = useState<'overview' | 'products' | 'orders'>('overview')
  const [profile,    setProfile]    = useState<{ first_name: string | null } | null>(null)
  const [stats,      setStats]      = useState<Stats | null>(null)
  const [products,   setProducts]   = useState<Product[]>([])
  const [orders,     setOrders]     = useState<SellerOrder[]>([])
  const [pageLoading, setPageLoading] = useState(true)

  // form state
  const [showForm,   setShowForm]   = useState(false)
  const [form,       setForm]       = useState(EMPTY_FORM)
  const [formError,  setFormError]  = useState<string | null>(null)
  const [formOk,     setFormOk]     = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // ── auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login')
  }, [user, authLoading, router])

  // ── initial data load ───────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    if (!user) return
    setPageLoading(true)

    const [profileRes, statsRes, productsRes, ordersRes] = await Promise.all([
      fetch('/api/seller/profile'),
      fetch('/api/seller/stats'),
      fetch('/api/seller/products'),
      fetch('/api/seller/orders'),
    ])

    if (profileRes.ok)  setProfile(await profileRes.json())
    if (statsRes.ok)    setStats(await statsRes.json())
    if (productsRes.ok) setProducts(await productsRes.json())
    if (ordersRes.ok)   setOrders(await ordersRes.json())

    setPageLoading(false)
  }, [user])

  useEffect(() => { loadAll() }, [loadAll])

  // ── add product ─────────────────────────────────────────────────────────────
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormOk(false)

    // client-side validation
    if (!form.name.trim())     return setFormError('Product name is required')
    if (!form.category)        return setFormError('Please select a category')
    if (!form.price)           return setFormError('Price is required')
    if (Number(form.price) <= 0) return setFormError('Price must be greater than 0')
    if (!form.stock)           return setFormError('Stock quantity is required')
    if (Number(form.stock) < 0)  return setFormError('Stock cannot be negative')
    if (form.original_price && Number(form.original_price) <= Number(form.price)) {
      return setFormError('Original price must be higher than selling price')
    }

    setSubmitting(true)
    const res = await fetch('/api/seller/products', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(form),
    })

    const data = await res.json()

    if (!res.ok) {
      setFormError(data.error ?? 'Failed to add product')
      setSubmitting(false)
      return
    }

    // update UI instantly without refetch
    setProducts(prev => [data, ...prev])
    setStats(prev => prev ? { ...prev, productCount: prev.productCount + 1 } : prev)
    setForm(EMPTY_FORM)
    setFormOk(true)
    setSubmitting(false)
    setTimeout(() => { setFormOk(false); setShowForm(false) }, 1500)
  }

  // ── delete product ──────────────────────────────────────────────────────────
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

  // ── loading state ───────────────────────────────────────────────────────────
  if (authLoading || pageLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background py-8">
          <div className="mx-auto max-w-5xl px-4 flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </>
    )
  }

  if (!user) return null

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-8">
        <div className="mx-auto max-w-5xl px-4">

          {/* Page header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Seller Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Welcome back, {profile?.first_name ?? 'Seller'}
              </p>
            </div>
            <Button
              variant="ghost"
              className="gap-2 text-destructive hover:text-destructive"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-8 border-b border-border">
            {(['overview', 'products', 'orders'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                  tab === t
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {t}
                {t === 'orders' && stats && stats.pendingOrders > 0 && (
                  <span className="ml-2 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                    {stats.pendingOrders}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW TAB ── */}
          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{stats ? fmt(stats.totalSales) : '—'}</p>
                    <p className="text-xs text-muted-foreground mt-1">From completed orders</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Products Listed</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{stats?.productCount ?? '—'}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats?.productCount === 0 ? 'Add your first product' : 'Active listings'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Pending Orders</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{stats?.pendingOrders ?? '—'}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats?.pendingOrders === 0 ? 'All caught up' : 'Need attention'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Recent Orders</h2>
                    <Button variant="outline" size="sm" onClick={() => setTab('orders')}>
                      View all
                    </Button>
                  </div>
                  {orders.length === 0 ? (
                    <p className="text-muted-foreground text-sm py-6 text-center">No orders yet</p>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 3).map(order => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div>
                            <p className="text-sm font-medium">Order #{order.id.slice(0, 8)}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{fmt(order.total)}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── PRODUCTS TAB ── */}
          {tab === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Your Products</h2>
                <Button onClick={() => { setShowForm(true); setFormError(null); setFormOk(false) }} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Product
                </Button>
              </div>

              {/* Add product form */}
              {showForm && (
                <Card className="border-primary/30">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base">New Product</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddProduct} className="space-y-4">

                      {formError && (
                        <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                          <AlertCircle className="h-4 w-4 flex-shrink-0" />
                          {formError}
                        </div>
                      )}
                      {formOk && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                          <CheckCircle className="h-4 w-4 flex-shrink-0" />
                          Product added successfully!
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 space-y-2">
                          <Label htmlFor="name">Product Name *</Label>
                          <Input id="name" placeholder="e.g. Vintage Denim Jacket"
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea id="description" placeholder="Describe your product..."
                            rows={3}
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="category">Category *</Label>
                          <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                            <SelectTrigger id="category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORIES.map(c => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="stock">Stock Quantity *</Label>
                          <Input id="stock" type="number" min="0" placeholder="0"
                            value={form.stock}
                            onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="price">Selling Price (KSh) *</Label>
                          <Input id="price" type="number" min="0" step="0.01" placeholder="0.00"
                            value={form.price}
                            onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="original_price">Original Price (KSh) <span className="text-muted-foreground text-xs">optional</span></Label>
                          <Input id="original_price" type="number" min="0" step="0.01" placeholder="Shows as crossed-out price"
                            value={form.original_price}
                            onChange={e => setForm(f => ({ ...f, original_price: e.target.value }))}
                          />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                          <Label htmlFor="image_url">Image URL <span className="text-muted-foreground text-xs">optional</span></Label>
                          <Input id="image_url" type="url" placeholder="https://..."
                            value={form.image_url}
                            onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                          />
                          <p className="text-xs text-muted-foreground">
                            Paste a direct image URL. You can use <a href="https://imgur.com" target="_blank" rel="noreferrer" className="underline">Imgur</a> to host images for free.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button type="submit" disabled={submitting} className="gap-2">
                          {submitting
                            ? <><Loader2 className="h-4 w-4 animate-spin" />Adding...</>
                            : <><Plus className="h-4 w-4" />Add Product</>}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Products list */}
              {products.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="font-medium">No products yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Click "Add Product" to list your first item</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3">
                  {products.map(product => (
                    <Card key={product.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          {/* Image */}
                          <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name}
                                className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.category}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-sm font-semibold">{fmt(product.price)}</span>
                              {product.original_price && (
                                <span className="text-xs text-muted-foreground line-through">
                                  {fmt(product.original_price)}
                                </span>
                              )}
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                product.stock > 0
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                              </span>
                            </div>
                          </div>

                          {/* Delete */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive flex-shrink-0"
                            onClick={() => handleDelete(product.id)}
                            disabled={deletingId === product.id}
                          >
                            {deletingId === product.id
                              ? <Loader2 className="h-4 w-4 animate-spin" />
                              : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── ORDERS TAB ── */}
          {tab === 'orders' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Orders for Your Products</h2>

              {orders.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="font-medium">No orders yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Orders will appear here when customers buy your products</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {orders.map(order => (
                    <Card key={order.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{fmt(order.total)}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                        </div>

                        {/* Items */}
                        <div className="space-y-2 mb-3">
                          {order.items.map(item => (
                            <div key={item.id} className="flex justify-between text-sm bg-muted/30 rounded px-3 py-2">
                              <span>{item.product?.name ?? 'Unknown product'} × {item.quantity}</span>
                              <span className="font-medium">{fmt(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Delivery info */}
                        <div className="text-xs text-muted-foreground border-t pt-3">
                          <span className="font-medium">Deliver to:</span> {order.shipping_address}, {order.shipping_city} · {order.phone}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </>
  )
}
