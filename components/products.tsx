"use client"

import Link from "next/link"
import useSWR from "swr"
import { Heart, ShoppingBag, Star, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import type { Product } from "@/lib/types"

interface ApiResponse {
  success: boolean
  data?: Product[]
  error?: string
}

const fetcher = async (url: string): Promise<Product[]> => {
  const res = await fetch(url)
  if (!res.ok) return []
  const json: ApiResponse = await res.json()
  // Handle new response format { success, data }
  if (json.success && Array.isArray(json.data)) {
    return json.data
  }
  // Handle old format (direct array)
  if (Array.isArray(json)) {
    return json as unknown as Product[]
  }
  return []
}

function formatPrice(price: number): string {
  return `KSh ${price.toLocaleString()}`
}

function getDiscount(price: number, originalPrice: number | null): number | null {
  if (!originalPrice || originalPrice <= price) return null
  return Math.round(((originalPrice - price) / originalPrice) * 100)
}

export function Products() {
  const { data: products, isLoading } = useSWR<Product[]>('/api/products?featured=true&limit=8', fetcher)
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  const handleAddToCart = async (productId: string) => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    await addToCart(productId)
  }

  const handleToggleWishlist = async (productId: string) => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId)
    } else {
      await addToWishlist(productId)
    }
  }

  if (isLoading) {
    return (
      <section id="shop" className="py-16 sm:py-24 bg-secondary/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="shop" className="py-16 sm:py-24 bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Trending Now
            </h2>
            <p className="text-muted-foreground text-lg mt-2">
              Most popular items this week
            </p>
          </div>
          <Button variant="outline" className="w-fit" asChild>
            <Link href="/shop">View All Products</Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {products?.map((product) => {
            const discount = getDiscount(product.price, product.original_price)
            const inWishlist = isInWishlist(product.id)
            
            return (
              <div
                key={product.id}
                className="group relative flex flex-col overflow-hidden rounded-xl bg-card"
              >
                {/* Image Container */}
                <Link href={`/product/${product.id}`} className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={product.image_url || 'https://via.placeholder.com/400x500'}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
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
                  </div>
                </Link>

                {/* Wishlist Button */}
                <button
                  onClick={() => handleToggleWishlist(product.id)}
                  className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-card/90 backdrop-blur transition-colors hover:bg-card z-10"
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
                <div className="absolute inset-x-3 bottom-[140px] opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 z-10">
                  <Button 
                    className="w-full gap-2" 
                    size="sm"
                    onClick={() => handleAddToCart(product.id)}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Add to Cart
                  </Button>
                </div>

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
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
