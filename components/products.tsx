"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface SellerProduct {
  id: string
  name: string
  price: number
  original_price: number | null
  image_url: string | null
  category: string
  stock?: number | null
}

function formatPrice(price: number): string {
  return `KSh ${price.toLocaleString()}`
}

export function Products() {
  const [products, setProducts] = useState<SellerProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [addingId, setAddingId] = useState<string | null>(null)

  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('products')
          .select('id, name, title, price, original_price, image_url, category, stock')
          // FIX: removed .eq('is_active', true) — null values were filtering out real products.
          // Products are visible by default unless explicitly set inactive.
          .order('created_at', { ascending: false })
          .limit(8)

        if (!error && data) {
          setProducts(data.map(p => ({ ...p, name: p.name || p.title || 'Product' })))
        }
      } catch (e) {
        console.error('Failed to fetch products:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const handleAddToCart = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault() // prevent Link navigation
    setAddingId(productId)
    await addToCart(productId)
    setAddingId(null)
  }

  const handleToggleWishlist = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault()
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
    <section id="shop" className="py-16 sm:py-24 bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {loading ? 'Loading...' : products.length > 0 ? 'Featured Products' : 'Trending Soon'}
            </h2>
            <p className="text-muted-foreground text-lg mt-2">
              {loading
                ? 'Fetching latest listings'
                : products.length > 0
                ? `${products.length} products from our sellers`
                : 'Our sellers are listing products right now'}
            </p>
          </div>
          <Button variant="outline" className="w-fit" asChild>
            <Link href="/shop">View All Products</Link>
          </Button>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-muted rounded-xl" />
                <div className="mt-4 h-4 bg-muted rounded w-3/4" />
                <div className="mt-2 h-4 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && products.length === 0 && (
          <div className="text-center py-20">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Products coming soon</h3>
            <p className="text-muted-foreground mb-6">
              Be the first to list products on gikomba.shop
            </p>
            <Button asChild>
              <Link href="/auth/sign-up?role=seller">Become a Seller</Link>
            </Button>
          </div>
        )}

        {/* Product grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {products.map((product) => {
              const inWishlist = isInWishlist(product.id)
              const inStock = (product.stock ?? 1) > 0
              const discount = product.original_price && product.original_price > product.price
                ? Math.round((1 - product.price / product.original_price) * 100)
                : null
              const isAdding = addingId === product.id

              return (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="group relative flex flex-col overflow-hidden rounded-xl bg-card hover:shadow-md transition-shadow"
                >
                  {/* Image */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                      src={product.image_url || '/placeholder-product.jpg'}
                      alt={product.name}
                      fill
                      className={cn(
                        "object-cover transition-transform duration-300 group-hover:scale-105",
                        !inStock && "opacity-60 grayscale"
                      )}
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      {discount && (
                        <Badge className="bg-primary text-primary-foreground text-xs">
                          {discount}% Off
                        </Badge>
                      )}
                      {!inStock && (
                        <Badge className="bg-gray-600 text-white text-xs">Out of Stock</Badge>
                      )}
                    </div>

                    {/* Wishlist button */}
                    <button
                      onClick={(e) => handleToggleWishlist(e, product.id)}
                      className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-card/90 backdrop-blur transition-colors hover:bg-card"
                    >
                      <Heart
                        className={cn(
                          "h-4 w-4 transition-colors",
                          inWishlist ? "fill-primary text-primary" : "text-muted-foreground"
                        )}
                      />
                    </button>

                    {/* Add to Cart — appears on hover */}
                    <div className="absolute inset-x-3 bottom-3 opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                      <Button
                        className="w-full gap-2"
                        size="sm"
                        disabled={!inStock || isAdding}
                        onClick={(e) => handleAddToCart(e, product.id)}
                      >
                        <ShoppingBag className="h-4 w-4" />
                        {isAdding ? 'Adding…' : inStock ? 'Add to Cart' : 'Out of Stock'}
                      </Button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex flex-col gap-2 p-4">
                    <h3 className="text-sm font-medium text-foreground line-clamp-1">
                      {product.name}
                    </h3>
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
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
