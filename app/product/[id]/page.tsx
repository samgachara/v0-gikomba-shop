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
import { toast } from 'sonner'

export default function ProductDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart()
  const { user } = useAuth()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

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

  const inStock = product ? (product.stock ?? 1) > 0 : false
  const lowStock = inStock && (product?.stock ?? 99) <= 5
  const inWishlist = product ? isInWishlist(product.id) : false

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please sign in to add items to your cart', {
        action: {
          label: 'Sign In',
          onClick: () => router.push('/auth/login'),
        },
      })
      return
    }
    setAdding(true)
    await addToCart(product.id)
    setAdding(false)
  }

  const handleToggleWishlist = async () => {
    if (!user) {
      toast.error('Please sign in to save items', {
        action: {
          label: 'Sign In',
          onClick: () => router.push('/auth/login'),
        },
      })
      return
    }
    inWishlist ? await removeFromWishlist(product.id) : await addToWishlist(product.id)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const formatPrice = (p: number) => `KSh ${p.toLocaleString()}`
  const discount = product.original_price && product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : null

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
            {/* Image */}
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted border border-border">
              <Image
                src={product.image_url || 'https://via.placeholder.com/800x800'}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className={cn('h-full w-full object-cover', !inStock && 'opacity-60 grayscale')}
              />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {!inStock && <Badge className="bg-gray-600 text-white">Out of Stock</Badge>}
                {inStock && lowStock && <Badge className="bg-orange-500 text-white">Only {product.stock} left!</Badge>}
                {inStock && !lowStock && product.is_new && <Badge className="bg-accent text-accent-foreground">New Arrival</Badge>}
                {discount && <Badge className="bg-primary text-primary-foreground">{discount}% Off</Badge>}
              </div>
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
                          'h-4 w-4',
                          i < Math.floor(product.rating || 4.5) ? 'fill-primary text-primary' : 'text-muted'
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
                <div className="flex items-baseline gap-4">
                  <p className="text-3xl font-bold text-foreground">{formatPrice(product.price)}</p>
                  {product.original_price && (
                    <p className="text-xl text-muted-foreground line-through">{formatPrice(product.original_price)}</p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <p className="text-base text-muted-foreground leading-relaxed">{product.description}</p>
              </div>

              {/* Stock status */}
              <div className="mt-4">
                {inStock && !lowStock && (
                  <p className="text-sm text-green-600 font-medium">✓ In Stock – Ready to ship</p>
                )}
                {lowStock && (
                  <p className="text-sm text-orange-500 font-medium">⚡ Only {product.stock} left in stock!</p>
                )}
                {!inStock && (
                  <p className="text-sm text-gray-500 font-medium">✗ Out of Stock</p>
                )}
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Button
                  size="lg"
                  className="flex-1 gap-2"
                  onClick={handleAddToCart}
                  disabled={adding || !inStock}
                >
                  {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-5 w-5" />}
                  {!inStock ? 'Out of Stock' : adding ? 'Adding...' : 'Add to Cart'}
                </Button>
                <Button size="lg" variant="outline" className="gap-2" onClick={handleToggleWishlist}>
                  <Heart className={cn('h-5 w-5', inWishlist && 'fill-primary text-primary')} />
                  {inWishlist ? 'Saved' : 'Wishlist'}
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

          {/* Customer Reviews Section */}
          <div className="mt-16 border-t border-border pt-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Customer Reviews</h2>
                <div className="flex items-center gap-2 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-4 w-4',
                        i < Math.floor(product.rating || 4.5) ? 'fill-primary text-primary' : 'text-muted'
                      )}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">
                    {product.rating || 4.5} out of 5 · {product.review_count || 12} reviews
                  </span>
                </div>
              </div>
            </div>

            {/* Static sample reviews — replace with real DB reviews when available */}
            <div className="space-y-6">
              {[
                { name: 'Amina W.', rating: 5, date: '2 weeks ago', body: 'Absolutely love this product! Great quality and fast delivery to Nairobi. Will definitely order again.' },
                { name: 'James K.', rating: 4, date: '1 month ago', body: 'Good value for money. Exactly as described. Packaging was secure and delivery was on time.' },
                { name: 'Grace M.', rating: 5, date: '1 month ago', body: 'Perfect! The quality exceeded my expectations. M-Pesa payment was seamless as always.' },
              ].map((review, i) => (
                <div key={i} className="border-b border-border pb-6 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {review.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{review.name}</p>
                        <p className="text-xs text-muted-foreground">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className={cn('h-3.5 w-3.5', j < review.rating ? 'fill-primary text-primary' : 'text-muted')} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{review.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
