"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { ArrowLeft, Heart, Minus, Plus, ShoppingBag, Star, Truck, Shield, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import type { Product } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then(res => res.json())

function formatPrice(price: number): string {
  return `KSh ${price.toLocaleString()}`
}

function getDiscount(price: number, originalPrice: number | null): number | null {
  if (!originalPrice || originalPrice <= price) return null
  return Math.round(((originalPrice - price) / originalPrice) * 100)
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: product, isLoading, error } = useSWR<Product>(`/api/products/${id}`, fetcher)
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)

  const handleAddToCart = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    setAdding(true)
    await addToCart(product!.id, quantity)
    setAdding(false)
  }

  const handleToggleWishlist = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    if (isInWishlist(product!.id)) {
      await removeFromWishlist(product!.id)
    } else {
      await addToWishlist(product!.id)
    }
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background py-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </>
    )
  }

  if (error || !product) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background py-8">
          <div className="mx-auto max-w-7xl px-4 text-center py-20">
            <h1 className="text-2xl font-bold mb-4">Product not found</h1>
            <Button asChild>
              <Link href="/shop">Back to Shop</Link>
            </Button>
          </div>
        </main>
      </>
    )
  }

  const discount = getDiscount(product.price, product.original_price)
  const inWishlist = isInWishlist(product.id)

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-8">
        <div className="mx-auto max-w-7xl px-4">
          <Button variant="ghost" className="mb-6 gap-2" asChild>
            <Link href="/shop">
              <ArrowLeft className="h-4 w-4" />
              Back to Shop
            </Link>
          </Button>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
              <img
                src={product.image_url || 'https://via.placeholder.com/600'}
                alt={product.name}
                className="h-full w-full object-cover"
              />
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.is_new && (
                  <Badge className="bg-accent text-accent-foreground">New Arrival</Badge>
                )}
                {discount && (
                  <Badge className="bg-primary text-primary-foreground">
                    {discount}% Off
                  </Badge>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground capitalize">{product.category}</p>
                  <h1 className="text-3xl font-bold mt-1">{product.name}</h1>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleToggleWishlist}
                  className="flex-shrink-0"
                >
                  <Heart
                    className={cn(
                      "h-5 w-5",
                      inWishlist ? "fill-primary text-primary" : ""
                    )}
                  />
                </Button>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < Math.floor(product.rating)
                          ? "fill-primary text-primary"
                          : "text-muted-foreground"
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating} ({product.review_count} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mt-6">
                <span className="text-3xl font-bold text-foreground">
                  {formatPrice(product.price)}
                </span>
                {product.original_price && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.original_price)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-muted-foreground mt-6">
                {product.description || 'No description available.'}
              </p>

              <Separator className="my-6" />

              {/* Quantity & Add to Cart */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button 
                  className="flex-1 gap-2" 
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={adding}
                >
                  {adding ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <ShoppingBag className="h-5 w-5" />
                  )}
                  Add to Cart
                </Button>
              </div>

              {/* Stock */}
              <p className="text-sm text-muted-foreground mt-4">
                {product.stock > 0 ? (
                  <span className="text-green-600">In Stock ({product.stock} available)</span>
                ) : (
                  <span className="text-red-600">Out of Stock</span>
                )}
              </p>

              <Separator className="my-6" />

              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Nationwide Delivery</p>
                    <p className="text-sm text-muted-foreground">Delivered within 2-5 business days</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Quality Guarantee</p>
                    <p className="text-sm text-muted-foreground">7-day return policy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
