'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Heart, ShoppingBag, Star, Loader2, ChevronLeft, ShieldCheck, Truck, RotateCcw, MessageCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Header } from '@/components/header'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Review {
  id: string
  rating: number
  comment: string
  created_at: string
  profiles: { first_name: string | null; last_name: string | null } | null
}

interface Seller {
  id: string
  store_name: string
  verified: boolean
  location: string | null
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart()
  const { user } = useAuth()

  const [product,   setProduct]   = useState<any>(null)
  const [seller,    setSeller]    = useState<Seller | null>(null)
  const [reviews,   setReviews]   = useState<Review[]>([])
  const [isAdmin,   setIsAdmin]   = useState(false)
  const [loading,   setLoading]   = useState(true)
  const [adding,    setAdding]    = useState(false)
  const [deletingReview, setDeletingReview] = useState<string | null>(null)

  // Load product + reviews + seller
  useEffect(() => {
    if (!id) return
    const supabase = createClient()

    async function load() {
      const { data, error } = await supabase
        .from('products').select('*').eq('id', id).single()

      if (error || !data) { router.push('/shop'); return }
      setProduct(data)

      // Load seller info
      if (data.seller_id) {
        const { data: sellerData } = await supabase
          .from('sellers')
          .select('id, store_name, verified, location')
          .eq('id', data.seller_id)
          .single()
        if (sellerData) setSeller(sellerData)
      }

      // Load real reviews
      const { data: reviewData } = await supabase
        .from('product_reviews')
        .select('id, rating, comment, created_at, profiles(first_name, last_name)')
        .eq('product_id', id)
        .order('created_at', { ascending: false })
        .limit(20)
      setReviews(reviewData ?? [])
      setLoading(false)
    }

    load()
  }, [id, router])

  // Check admin role separately so it fires after auth resolves
  useEffect(() => {
    if (!user) { setIsAdmin(false); return }
    const supabase = createClient()
    supabase.from('profiles').select('role').eq('id', user.id).single()
      .then(({ data }) => setIsAdmin(data?.role === 'admin'))
  }, [user])

  const inStock   = product ? (product.stock ?? 1) > 0 : false
  const lowStock  = inStock && (product?.stock ?? 99) <= 5
  const inWishlist = product ? isInWishlist(product.id) : false

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please sign in to add items to your cart', {
        action: { label: 'Sign In', onClick: () => router.push('/auth/login') },
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
        action: { label: 'Sign In', onClick: () => router.push('/auth/login') },
      })
      return
    }
    inWishlist ? await removeFromWishlist(product.id) : await addToWishlist(product.id)
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Delete this review?')) return
    setDeletingReview(reviewId)
    const res = await fetch(`/api/admin/reviews/${reviewId}`, { method: 'DELETE' })
    if (res.ok) {
      setReviews(prev => prev.filter(r => r.id !== reviewId))
      toast.success('Review deleted')
    } else {
      toast.error('Failed to delete review')
    }
    setDeletingReview(null)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const fmt = (p: number) => `KSh ${p.toLocaleString()}`
  const discount = product.original_price && product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : null

  // WhatsApp — per-product message to the shop (or seller if we have their number)
  const waMsg = encodeURIComponent(
    `Hi Gikomba Shop! 👋 I'm interested in *${product.name}* (KSh ${product.price.toLocaleString()}).\n\nProduct link: https://gikomba.shop/product/${product.id}\n\nIs it available?`
  )
  const waHref = `https://wa.me/254736906440?text=${waMsg}`

  const reviewCount = reviews.length
  const avgRating = reviewCount > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviewCount
    : product.rating ?? 0

  return (
    <>
      <Header />
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <button onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ChevronLeft className="h-4 w-4" /> Back to shop
          </button>

          <div className="lg:grid lg:grid-cols-2 lg:gap-x-12">
            {/* Image */}
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted border border-border">
              <Image
                src={product.image_url || 'https://via.placeholder.com/800x800'}
                alt={product.name}
                fill priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className={cn('h-full w-full object-cover', !inStock && 'opacity-60 grayscale')}
              />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {!inStock && <Badge className="bg-gray-600 text-white">Out of Stock</Badge>}
                {inStock && lowStock && <Badge className="bg-orange-500 text-white">Only {product.stock} left!</Badge>}
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
                      <Star key={i} className={cn('h-4 w-4', i < Math.floor(avgRating) ? 'fill-primary text-primary' : 'text-muted')} />
                    ))}
                    <span className="ml-2 text-sm text-muted-foreground">
                      {avgRating > 0 ? avgRating.toFixed(1) : 'No reviews yet'}
                      {reviewCount > 0 && ` (${reviewCount} review${reviewCount !== 1 ? 's' : ''})`}
                    </span>
                  </div>
                  <Badge variant="outline" className="capitalize">{product.category}</Badge>
                </div>
              </div>

              <div className="mt-6 flex items-baseline gap-4">
                <p className="text-3xl font-bold text-foreground">{fmt(product.price)}</p>
                {product.original_price && (
                  <p className="text-xl text-muted-foreground line-through">{fmt(product.original_price)}</p>
                )}
              </div>

              <p className="mt-6 text-base text-muted-foreground leading-relaxed">{product.description}</p>

              {/* Stock status */}
              <div className="mt-4">
                {inStock && !lowStock && <p className="text-sm text-green-600 font-medium">✓ In Stock – Ready to ship</p>}
                {lowStock && <p className="text-sm text-orange-500 font-medium">⚡ Only {product.stock} left in stock!</p>}
                {!inStock && <p className="text-sm text-gray-500 font-medium">✗ Out of Stock</p>}
              </div>

              {/* Seller info */}
              {seller && (
                <div className="mt-6 p-4 bg-muted/40 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">
                      {seller.store_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium">{seller.store_name}</p>
                        {seller.verified && <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />}
                      </div>
                      {seller.location && <p className="text-xs text-muted-foreground">{seller.location}</p>}
                    </div>
                  </div>
                  <a href={`/vendor/${seller.id}`} className="text-xs text-primary hover:underline shrink-0">View Store</a>
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="flex-1 gap-2" onClick={handleAddToCart} disabled={adding || !inStock}>
                  {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-5 w-5" />}
                  {!inStock ? 'Out of Stock' : adding ? 'Adding...' : 'Add to Cart'}
                </Button>
                <Button size="lg" variant="outline" className="gap-2" onClick={handleToggleWishlist}>
                  <Heart className={cn('h-5 w-5', inWishlist && 'fill-primary text-primary')} />
                  {inWishlist ? 'Saved' : 'Wishlist'}
                </Button>
              </div>

              {/* WhatsApp buy button */}
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#25D366' }}
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Buy via WhatsApp
              </a>

              {/* Trust badges */}
              <div className="mt-10 grid grid-cols-1 gap-4 border-t border-border pt-8 sm:grid-cols-3">
                {[
                  { icon: Truck, title: 'Fast Delivery', sub: 'Within 24-48 hours' },
                  { icon: ShieldCheck, title: 'Secure Payment', sub: 'M-Pesa & Card' },
                  { icon: RotateCcw, title: 'Easy Returns', sub: '7-day policy' },
                ].map(({ icon: Icon, title, sub }) => (
                  <div key={title} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-xs">
                      <p className="font-semibold">{title}</p>
                      <p className="text-muted-foreground">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews section — real DB data */}
          <div className="mt-16 border-t border-border pt-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Customer Reviews</h2>
                <div className="flex items-center gap-2 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={cn('h-4 w-4', i < Math.floor(avgRating) ? 'fill-primary text-primary' : 'text-muted')} />
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">
                    {reviewCount > 0 ? `${avgRating.toFixed(1)} out of 5 · ${reviewCount} review${reviewCount !== 1 ? 's' : ''}` : 'No reviews yet'}
                  </span>
                </div>
              </div>
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Star className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No reviews yet</p>
                <p className="text-sm mt-1">Be the first to review this product after purchase.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map(review => {
                  const name = [review.profiles?.first_name, review.profiles?.last_name]
                    .filter(Boolean).join(' ') || 'Customer'
                  const date = new Date(review.created_at).toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })
                  return (
                    <div key={review.id} className="border-b border-border pb-6 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{name}</p>
                            <p className="text-xs text-muted-foreground">{date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, j) => (
                              <Star key={j} className={cn('h-3.5 w-3.5', j < review.rating ? 'fill-primary text-primary' : 'text-muted')} />
                            ))}
                          </div>
                          {isAdmin && (
                            <button
                              className="ml-2 text-destructive hover:text-destructive/70 transition-colors"
                              onClick={() => handleDeleteReview(review.id)}
                              disabled={deletingReview === review.id}
                              title="Delete review"
                            >
                              {deletingReview === review.id
                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                : <Trash2 className="h-3.5 w-3.5" />}
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
