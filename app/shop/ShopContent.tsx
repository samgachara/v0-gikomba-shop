'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Heart,
  ShoppingBag,
  Star,
  Loader2,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import useSWR from 'swr'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { cn } from '@/lib/utils'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import {
  SHOP_CATEGORY_OPTIONS,
  SHOP_SORT_OPTIONS,
  type ShopProductsResult,
  type ShopQueryState,
} from '@/lib/shop'

interface ShopContentProps {
  initialData: ShopProductsResult
  initialState: ShopQueryState
}

const fetcher = async (url: string): Promise<ShopProductsResult> => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Failed to fetch products')
  }

  const payload = await response.json()
  return payload.data as ShopProductsResult
}

export default function ShopContent({ initialData, initialState }: ShopContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart()
  const { user } = useAuth()

  const [search, setSearch] = useState(initialState.search)
  const [category, setCategory] = useState(initialState.category)
  const [sort, setSort] = useState(initialState.sort)
  const [page, setPage] = useState(initialState.page)

  const filter = searchParams.get('filter') ?? initialState.filter ?? ''
  const limit = initialData.limit || initialState.limit

  const requestParams = useMemo(() => {
    const params = new URLSearchParams()
    if (category && category !== 'all') params.set('category', category)
    if (search) params.set('search', search)
    if (sort && sort !== 'newest') params.set('sort', sort)
    if (filter) params.set('filter', filter)
    params.set('page', String(page))
    params.set('limit', String(limit))
    return params
  }, [category, filter, limit, page, search, sort])

  const { data, isLoading } = useSWR<ShopProductsResult>(
    `/api/products?${requestParams.toString()}`,
    fetcher,
    {
      fallbackData: initialData,
      keepPreviousData: true,
    },
  )

  const products = data?.products ?? []
  const totalCount = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / limit))

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setPage(1)
  }

  const handleCategory = (nextCategory: string) => {
    setCategory(nextCategory)
    setPage(1)

    const next = new URLSearchParams(searchParams.toString())
    if (nextCategory === 'all') next.delete('category')
    else next.set('category', nextCategory)

    router.push(next.toString() ? `/shop?${next.toString()}` : '/shop')
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

    if (isInWishlist(productId)) {
      await removeFromWishlist(productId)
      return
    }

    await addToWishlist(productId)
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Shop</h1>
            <p className="mt-1 text-muted-foreground">
              {totalCount > 0 ? `${totalCount} products available` : 'Browse our collection'}
            </p>
          </div>

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <form onSubmit={handleSearch} className="flex flex-1 gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value)
                    setPage(1)
                  }}
                  className="pl-9"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('')
                      setPage(1)
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button type="submit" variant="secondary">
                Search
              </Button>
            </form>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2" type="button">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
              <select
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value)
                  setPage(1)
                }}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                {SHOP_SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-8 flex flex-wrap gap-2">
            {SHOP_CATEGORY_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleCategory(option.value)}
                className={cn(
                  'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                  category === option.value
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-foreground hover:border-primary/50',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <ShoppingBag className="mb-4 h-12 w-12 text-muted-foreground/40" />
              <p className="text-lg font-medium">No products found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {search ? `No results for "${search}" - try a different search` : 'Check back soon for new listings!'}
              </p>
              {search && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearch('')
                    setPage(1)
                  }}
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => {
                const inWishlist = isInWishlist(product.id)
                const inStock = (product.stock ?? 1) > 0
                const discount =
                  product.original_price && product.original_price > product.price
                    ? Math.round(
                        ((product.original_price - product.price) / product.original_price) * 100,
                      )
                    : null

                return (
                  <div
                    key={product.id}
                    className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
                  >
                    <Link href={`/product/${product.id}`} className="relative aspect-square overflow-hidden bg-muted">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className={cn(
                            'h-full w-full object-cover transition-transform duration-300 group-hover:scale-105',
                            !inStock && 'opacity-60 grayscale',
                          )}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <ShoppingBag className="h-10 w-10 opacity-30" />
                        </div>
                      )}

                      <div className="absolute left-2 top-2 flex flex-col gap-1">
                        {!inStock && (
                          <Badge className="bg-gray-600 text-xs text-white">Out of Stock</Badge>
                        )}
                        {discount && (
                          <Badge className="bg-primary text-xs text-primary-foreground">
                            {discount}% Off
                          </Badge>
                        )}
                        {product.is_new && (
                          <Badge className="bg-blue-500 text-xs text-white">New</Badge>
                        )}
                      </div>

                      <button
                        onClick={(event) => {
                          event.preventDefault()
                          void handleToggleWishlist(product.id)
                        }}
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                      >
                        <Heart
                          className={cn(
                            'h-4 w-4',
                            inWishlist ? 'fill-primary text-primary' : 'text-foreground',
                          )}
                        />
                      </button>
                    </Link>

                    <div className="flex flex-1 flex-col gap-2 p-3">
                      <Link href={`/product/${product.id}`}>
                        <p className="line-clamp-2 text-sm font-medium transition-colors hover:text-primary">
                          {product.name}
                        </p>
                      </Link>

                      {(product.rating ?? 0) > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-primary text-primary" />
                          <span className="text-xs text-muted-foreground">
                            {Number(product.rating).toFixed(1)}
                          </span>
                        </div>
                      )}

                      <div className="mt-auto flex items-baseline gap-2">
                        <span className="text-sm font-bold">KSh {product.price?.toLocaleString()}</span>
                        {product.original_price && (
                          <span className="text-xs text-muted-foreground line-through">
                            KSh {product.original_price?.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {product.quality_grade && (
                        <span
                          className={`self-start rounded-full border px-2 py-0.5 text-xs font-semibold ${
                            {
                              A: 'border-green-200 bg-green-50 text-green-700',
                              B: 'border-blue-200 bg-blue-50 text-blue-700',
                              C: 'border-yellow-200 bg-yellow-50 text-yellow-700',
                            }[product.quality_grade]
                          }`}
                        >
                          Grade {product.quality_grade}
                        </span>
                      )}

                      <Button
                        size="sm"
                        className="mt-1 w-full gap-1.5"
                        disabled={!inStock}
                        onClick={() => void handleAddToCart(product.id)}
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

          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-2 text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
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
