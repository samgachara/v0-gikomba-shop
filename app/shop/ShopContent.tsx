'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Heart, ShoppingBag, Star, Loader2, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { Header } from '@/components/header'
import { useProducts } from '@/hooks/use-products'
import { useDebounce } from '@/hooks/use-debounce'

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'women', label: "Women's Fashion" },
  { value: 'men', label: "Men's Fashion" },
  { value: 'electronics', label: 'Electronics' },
  { value: 'home', label: 'Home & Living' },
  { value: 'kids', label: 'Kids' },
  { value: 'accessories', label: 'Accessories' },
]

function formatPrice(p: number) { return `KSh ${p.toLocaleString()}` }
function getDiscount(price: number, orig: number | null) {
  if (!orig || orig <= price) return null
  return Math.round(((orig - price) / orig) * 100)
}

export default function ShopContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [category, setCategory] = useState(searchParams.get('category') || 'all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(search, 400)

  const { products, isLoading, totalPages, hasNextPage, hasPrevPage } = useProducts({
    category,
    search: debouncedSearch,
    featured: searchParams.get('filter') === 'new',
    page,
    limit: 20,
  })

  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart()
  const { user } = useAuth()

  // Reset to page 1 when filters change
  const handleCategoryChange = (val: string) => { setCategory(val); setPage(1) }
  const handleSearchChange = (val: string) => { setSearch(val); setPage(1) }

  const handleAddToCart = async (productId: string) => {
    if (!user) { router.push('/auth/login'); return }
    await addToCart(productId)
  }

  const handleToggleWishlist = async (productId: string) => {
    if (!user) { router.push('/auth/login'); return }
    isInWishlist(productId) ? await removeFromWishlist(productId) : await addToWishlist(productId)
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="border-b border-border bg-secondary/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-foreground">Shop</h1>
            <p className="text-muted-foreground mt-2">Discover amazing deals on quality products</p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No products found</p>
              <Button variant="outline" className="mt-4" onClick={() => { setSearch(''); setCategory('all') }}>
                Clear filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
                {products.map((product) => {
                  const discount = getDiscount(product.price, product.original_price)
                  const inWishlist = isInWishlist(product.id)
                  return (
                    <div key={product.id} className="group relative flex flex-col overflow-hidden rounded-xl bg-card border border-border">
                      <Link href={`/product/${product.id}`} className="relative aspect-[3/4] overflow-hidden">
                        <img
                          src={product.image_url || 'https://via.placeholder.com/400x500'}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          {product.is_new && <Badge className="bg-accent text-accent-foreground">New</Badge>}
                          {discount && <Badge variant="secondary" className="bg-primary text-primary-foreground">{discount}% Off</Badge>}
                        </div>
                      </Link>

                      <button
                        onClick={() => handleToggleWishlist(product.id)}
                        className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm"
                      >
                        <Heart className={cn('h-4 w-4 transition-colors', inWishlist ? 'fill-primary text-primary' : 'text-muted-foreground')} />
                      </button>

                      <div className="absolute inset-x-3 bottom-[140px] opacity-0 translate-y-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0">
                        <Button className="w-full gap-2" size="sm" onClick={() => handleAddToCart(product.id)}>
                          <ShoppingBag className="h-4 w-4" />Add to Cart
                        </Button>
                      </div>

                      <div className="flex flex-col gap-2 p-4">
                        <Link href={`/product/${product.id}`}>
                          <h3 className="text-sm font-medium line-clamp-1 hover:text-primary transition-colors">{product.name}</h3>
                        </Link>
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                          <span className="text-xs text-muted-foreground">{product.rating} ({product.review_count})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-semibold">{formatPrice(product.price)}</span>
                          {product.original_price && (
                            <span className="text-sm text-muted-foreground line-through">{formatPrice(product.original_price)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-12">
                  <Button variant="outline" size="icon" onClick={() => setPage(p => p - 1)} disabled={!hasPrevPage}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                  <Button variant="outline" size="icon" onClick={() => setPage(p => p + 1)} disabled={!hasNextPage}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  )
}
