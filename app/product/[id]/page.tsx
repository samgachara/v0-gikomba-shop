'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Heart, ShoppingBag, Star, Loader2, ChevronLeft, ShieldCheck, Truck, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Header } from '@/components/header'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'

export default function ProductDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { addItem } = useCart()
  const { user } = useAuth()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [wishlist, setWishlist] = useState<string[]>([])

  useEffect(() => {
    async function fetchProduct() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        router.push('/shop')
        return
      }
      setProduct(data)
      setLoading(false)
    }

    if (id) fetchProduct()
  }, [id, router])

  const handleAddToCart = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    setAdding(true)
    await addItem(product.id, 1)
    setAdding(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const formatPrice = (p: number) => `KSh ${p.toLocaleString()}`

  return (
    <>
      <Header />
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back to shop
          </button>

          <div className="lg:grid lg:grid-cols-2 lg:gap-x-12">
            {/* Image gallery */}
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted border border-border">
              <Image
                src={product.image_url || 'https://via.placeholder.com/800x800'}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="h-full w-full object-cover"
              />
              {product.is_new && (
                <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground">New Arrival</Badge>
              )}
            </div>

            {/* Product info */}
            <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">{product.name}</h1>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={cn(
                          "h-4 w-4",
                          i < Math.floor(product.rating || 4.5) ? "fill-primary text-primary" : "text-muted"
                        )} 
                      />
                    ))}
                    <span className="ml-2 text-sm text-muted-foreground">
                      {product.rating || 4.5} ({product.review_count || 12} reviews)
                    </span>
                  </div>
                  <Badge variant="outline" className="capitalize">{product.category}</Badge>
                </div>
              </div>

              <div className="mt-6">
                <h2 className="sr-only">Product information</h2>
                <div className="flex items-baseline gap-4">
                  <p className="text-3xl font-bold text-foreground">{formatPrice(product.price)}</p>
                  {product.original_price && (
                    <p className="text-xl text-muted-foreground line-through">
                      {formatPrice(product.original_price)}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="sr-only">Description</h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Button 
                  size="lg" 
                  className="flex-1 gap-2" 
                  onClick={handleAddToCart}
                  disabled={adding || product.stock === 0}
                >
                  {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-5 w-5" />}
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
                <Button size="lg" variant="outline" className="gap-2">
                  <Heart className="h-5 w-5" /> Wishlist
                </Button>
              </div>

              {/* Trust badges */}
              <div className="mt-12 grid grid-cols-1 gap-4 border-t border-border pt-8 sm:grid-cols-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold">Fast Delivery</p>
                    <p className="text-muted-foreground">Within 24-48 hours</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold">Secure Payment</p>
                    <p className="text-muted-foreground">M-Pesa & Card</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <RotateCcw className="h-5 w-5" />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold">Easy Returns</p>
                    <p className="text-muted-foreground">7-day policy</p>
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
