"use client"

import { useState, useMemo, useCallback } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import useSWR from "swr"
import { Heart, ShoppingBag, Star, Loader2, Search, Filter, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import type { Product } from "@/lib/types"
import type { ApiResponse } from "@/lib/api-utils"

interface ProductsResponse {
  data: Product[]
  meta?: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
}

const fetcher = async (url: string): Promise<ProductsResponse> => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch products')
  const json: ApiResponse<Product[]> = await res.json()
  // Handle both old and new response formats
  if ('success' in json && json.data !== undefined) {
    return { 
      data: json.data, 
      meta: json.meta 
    }
  }
  // Old format - array directly
  return { data: json as unknown as Product[] }
}

const categories = [
  { value: "all", label: "All Categories" },
  { value: "women", label: "Women's Fashion" },
  { value: "men", label: "Men's Fashion" },
  { value: "electronics", label: "Electronics" },
  { value: "home", label: "Home & Living" },
  { value: "kids", label: "Kids" },
  { value: "accessories", label: "Accessories" },
]

const ITEMS_PER_PAGE = 12

function formatPrice(price: number): string {
  return `KSh ${price.toLocaleString()}`
}

function getDiscount(price: number, originalPrice: number | null): number | null {
  if (!originalPrice || originalPrice <= price) return null
  return Math.round(((originalPrice - price) / originalPrice) * 100)
}

// Product card skeleton for loading state
function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-card border border-border">
      <Skeleton className="aspect-[3/4] w-full" />
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-5 w-1/3" />
      </div>
    </div>
  )
}

// Empty state component
function EmptyState({ searchQuery, category }: { searchQuery: string; category: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">No products found</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        {searchQuery 
          ? `No products match "${searchQuery}"${category !== 'all' ? ` in ${categories.find(c => c.value === category)?.label}` : ''}.`
          : category !== 'all' 
            ? `No products in ${categories.find(c => c.value === category)?.label} yet.`
            : 'No products available at the moment.'}
      </p>
      <Button variant="outline" asChild>
        <Link href="/shop">View All Products</Link>
      </Button>
    </div>
  )
}

// Error state component
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-lg font-medium mb-2">Failed to load products</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        Something went wrong while fetching products. Please try again.
      </p>
      <Button onClick={onRetry}>Try Again</Button>
    </div>
  )
}

export default function ShopPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialCategory = searchParams.get('category') || 'all'
  const initialPage = parseInt(searchParams.get('page') || '1', 10)
  
  const [category, setCategory] = useState(initialCategory)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(initialPage)
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  
  // Build API URL with pagination
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams()
    if (category !== 'all') params.set('category', category)
    params.set('page', String(page))
    params.set('limit', String(ITEMS_PER_PAGE))
    return `/api/products?${params.toString()}`
  }, [category, page])
  
  const { data, isLoading, error, mutate } = useSWR<ProductsResponse>(apiUrl, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
  })

  const products = data?.data || []
  const meta = data?.meta
  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 1
  
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart()
  const { user } = useAuth()

  // Client-side search filtering
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products
    const query = searchQuery.toLowerCase()
    return products.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query)
    )
  }, [products, searchQuery])

  const handleCategoryChange = useCallback((newCategory: string) => {
    setCategory(newCategory)
    setPage(1) // Reset to first page on category change
    setSearchQuery('') // Clear search
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleAddToCart = useCallback(async (productId: string) => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    setAddingToCart(productId)
    await addToCart(productId)
    setAddingToCart(null)
  }, [user, router, addToCart])

  const handleToggleWishlist = useCallback(async (productId: string) => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId)
    } else {
      await addToWishlist(productId)
    }
  }, [user, router, isInWishlist, removeFromWishlist, addToWishlist])

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Page Header */}
        <div className="border-b border-border bg-secondary/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-foreground">Shop</h1>
            <p className="text-muted-foreground mt-2">
              Discover amazing deals on quality products
              {meta?.total && ` (${meta.total} items)`}
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Error State */}
          {error && <ErrorState onRetry={() => mutate()} />}

          {/* Loading State */}
          {isLoading && !error && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredProducts.length === 0 && (
            <EmptyState searchQuery={searchQuery} category={category} />
          )}

          {/* Products Grid */}
          {!isLoading && !error && filteredProducts.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
                {filteredProducts.map((product) => {
                  const discount = getDiscount(product.price, product.original_price)
                  const inWishlist = isInWishlist(product.id)
                  const isAdding = addingToCart === product.id
                  
                  return (
                    <div
                      key={product.id}
                      className="group relative flex flex-col overflow-hidden rounded-xl bg-card border border-border"
                    >
                      {/* Image Container */}
                      <Link href={`/product/${product.id}`} className="relative aspect-[3/4] overflow-hidden">
                        <img
                          src={product.image_url || 'https://via.placeholder.com/400x500'}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        
                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          {product.is_new && (
                            <Badge className="bg-accent text-accent-foreground">New</Badge>
                          )}
                          {discount && (
                            <Badge variant="secondary" className="bg-primary text-primary-foreground">
                              {discount}% Off
                            </Badge>
                          )}
                          {product.stock === 0 && (
                            <Badge variant="destructive">Out of Stock</Badge>
                          )}
                        </div>
                      </Link>

                      {/* Wishlist Button */}
                      <button
                        onClick={() => handleToggleWishlist(product.id)}
                        className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-card/90 backdrop-blur transition-colors hover:bg-card z-10"
                        aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <Heart
                          className={cn(
                            "h-4 w-4 transition-colors",
                            inWishlist
                              ? "fill-primary text-primary"
                              : "text-muted-foreground"
                          )}
                        />
                      </button>

                      {/* Quick Add */}
                      {product.stock > 0 && (
                        <div className="absolute inset-x-3 bottom-[140px] opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 z-10">
                          <Button 
                            className="w-full gap-2" 
                            size="sm"
                            onClick={() => handleAddToCart(product.id)}
                            disabled={isAdding}
                          >
                            {isAdding ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <ShoppingBag className="h-4 w-4" />
                            )}
                            {isAdding ? 'Adding...' : 'Add to Cart'}
                          </Button>
                        </div>
                      )}

                      {/* Product Info */}
                      <div className="flex flex-col gap-2 p-4">
                        <Link href={`/product/${product.id}`}>
                          <h3 className="text-sm font-medium text-foreground line-clamp-1 hover:text-primary transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                        
                        {/* Rating */}
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                          <span className="text-xs text-muted-foreground">
                            {product.rating} ({product.review_count})
                          </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-2">
                          <span className="text-base font-semibold text-foreground">
                            {formatPrice(product.price)}
                          </span>
                          {product.original_price && (
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPrice(product.original_price)}
                            </span>
                          )}
                        </div>

                        {/* Stock indicator */}
                        {product.stock > 0 && product.stock <= 5 && (
                          <p className="text-xs text-destructive">Only {product.stock} left!</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Pagination */}
              {meta && totalPages > 1 && !searchQuery && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (page <= 3) {
                        pageNum = i + 1
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = page - 2 + i
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "outline"}
                          size="icon"
                          onClick={() => handlePageChange(pageNum)}
                          className="w-10"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={!meta.hasMore}
                    aria-label="Next page"
                  >
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
