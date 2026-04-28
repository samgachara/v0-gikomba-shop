'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Heart, ShoppingBag, Star, Loader2, Search, SlidersHorizontal, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import useSWR from 'swr'
import { toast } from 'sonner'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const CATEGORIES = [
  'All',
  'Men\'s Fashion',
  'Women\'s Fashion',
  'Kids',
  'Shoes',
  'Bags & Accessories',
  'Electronics',
  'Home & Living',
]

const SORT_OPTIONS = [
  { label: 'Newest',       value: 'newest' },
  { label: 'Price: Low',   value: 'price_asc' },
  { label: 'Price: High',  value: 'price_desc' },
  { label: 'Top Rated',    value: 'rating' },
]

export default function ShopContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const categoryParam = searchParams.get('category') ?? 'All'
  const filterParam   = searchParams.get('filter')   ?? ''

  const [search,   setSearch]   = useState('')
  const [category, setCategory] = useState(categoryParam)
  const [sort,     setSort]     = useState('newest')
  const [page,     setPage]     = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart()
  const { user } = useAuth()

  const PER_PAGE = 12

  // Build query string for the API
  const params = new URLSearchParams()
  if (category && category !== 'All') params.set('category', category)
  if (search)   params.set('search', search)
  if (sort)     params.set('sort', sort)
  if (filterParam) params.set('filter', filterParam)
  params.set('page',     String(page))
  params.set('per_page', String(PER_PAGE))

  const { data, isLoading } = useSWR(`/api/products?${params.toString()}`, fetcher, {
    keepPreviousData: true,
  })

  const products   = data?.data   ?? []
  const totalCount = data?.total  ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE))

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
  }

  const handleCategory = (cat: string) => {
    setCategory(cat)
    setPage(1)
    const next = new URLSearchParams(searchParams.toString())
    if (cat === 'All') next.delete('category')
    else next.set('category', cat)
    router.push(`/shop?${next.toString()}`)
  }

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId)
  }

  const handleToggleWishlist = async (productId: string) => {
    if (!user) {
      toast.error('Sign in to save items', {
        action: { label: 'Sign In', onClick: () => router.push('/auth/login') },
      })
      return
    }
    isInWishlist(productId)
      ? await removeFromWishlist(productId)
      : await addToWishlist(productId)
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Page heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Shop</h1>
            <p className="mt-1 text-muted-foreground">
              {totalCount > 0 ? `${totalCount} products available` : 'Browse our collection'}
            </p>
          </div>

          {/* Search + filter bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-6">
            <form onSubmit={handleSearch} className="flex flex-1 gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1) }}
                  className="pl-9"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => { setSearch(''); setPage(1) }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button type="submit" variant="secondary">Search</Button>
            </form>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setShowFilters(f => !f)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
              <select
                value={sort}
                onChange={e => { setSort(e.target.value); setPage(1) }}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategory(cat)}
                className={cn(
                  'rounded-full px-4 py-1.5 text-sm font-medium transition-colors border',
                  category === cat
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-border hover:border-primary/50'
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product grid */}
          {isLoading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {search ? `No results for "${search}" — try a different search` : 'Check back soon for new listings!'}
              </p>
              {search && (
                <Button variant="outline" className="mt-4" onClick={() => { setSearch(''); setPage(1) }}>
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product: any) => {
                const inWishlist = isInWishlist(product.id)
                const inStock    = (product.stock ?? 1) > 0
                const discount   = product.original_price && product.original_price > product.price
                  ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
                  : null

                return (
                  <div key={product.id} className="group relative flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow">
                    {/* Image */}
                    <Link href={`/product/${product.id}`} className="relative aspect-square overflow-hidden bg-muted">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className={cn(
                            'h-full w-full object-cover transition-transform duration-300 group-hover:scale-105',
                            !inStock && 'opacity-60 grayscale'
                          )}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <ShoppingBag className="h-10 w-10 opacity-30" />
                        </div>
                      )}
                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {!inStock && <Badge className="bg-gray-600 text-white text-xs">Out of Stock</Badge>}
                        {discount  && <Badge className="bg-primary text-primary-foreground text-xs">{discount}% Off</Badge>}
                        {product.is_new && <Badge className="bg-blue-500 text-white text-xs">New</Badge>}
                      </div>
                      {/* Wishlist button */}
                      <button
                        onClick={e => { e.preventDefault(); handleToggleWishlist(product.id) }}
                        className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Heart className={cn('h-4 w-4', inWishlist ? 'fill-primary text-primary' : 'text-foreground')} />
                      </button>
                    </Link>

                    {/* Info */}
                    <div className="flex flex-col flex-1 p-3 gap-2">
                      <Link href={`/product/${product.id}`}>
                        <p className="text-sm font-medium line-clamp-2 hover:text-primary transition-colors">{product.name}</p>
                      </Link>

                      {/* Rating */}
                      {product.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-primary text-primary" />
                          <span className="text-xs text-muted-foreground">{Number(product.rating).toFixed(1)}</span>
                        </div>
                      )}

                      {/* Price */}
                      <div className="flex items-baseline gap-2 mt-auto">
                        <span className="font-bold text-sm">KSh {product.price?.toLocaleString()}</span>
                        {product.original_price && (
                          <span className="text-xs text-muted-foreground line-through">
                            KSh {product.original_price?.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Grade badge */}
                      {product.quality_grade && (
                        <span className={`self-start inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${{
                          'A': 'bg-green-50 text-green-700 border-green-200',
                          'B': 'bg-blue-50 text-blue-700 border-blue-200',
                          'C': 'bg-yellow-50 text-yellow-700 border-yellow-200',
                        }[product.quality_grade as string] ?? ''}`}>
                          Grade {product.quality_grade}
                        </span>
                      )}

                      <Button
                        size="sm"
                        className="w-full gap-1.5 mt-1"
                        disabled={!inStock}
                        onClick={() => handleAddToCart(product.id)}
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        {inStock ? 'Add to Cart' : 'Out of Stock'}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  )
}
