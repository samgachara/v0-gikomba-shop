'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Heart, ShoppingBag, Star, Loader2, ChevronLeft, ShieldCheck, Truck, RotateCcw, MessageCircle, Send, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { Header } from '@/components/header'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const WHATSAPP_NUMBER = '254736906440'

interface Review {
  id: string
  rating: number
  comment: string
  created_at: string
  profiles?: { first_name: string | null; last_name: string | null } | null
}

interface Seller {
  id: string
  store_name: string
  verified: boolean
  phone?: string | null
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart()
  const { user } = useAuth()

  const [product,    setProduct]    = useState<any>(null)
  const [seller,     setSeller]     = useState<Seller | null>(null)
  const [reviews,    setReviews]    = useState<Review[]>([])
  const [loading,    setLoading]    = useState(true)
  const [adding,     setAdding]     = useState(false)
  const [isAdmin,    setIsAdmin]    = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating,   setReviewRating]   = useState(5)
  const [reviewComment,  setReviewComment]  = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError,    setReviewError]    = useState<string | null>(null)

  // ── Fetch product + seller + reviews ────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    if (!id) return
    const supabase = createClient()

    const [{ data: productData }, { data: reviewsData }] = await Promise.all([
      supabase.from('products').select('*').eq('id', id).single(),
      supabase
        .from('product_reviews')
        .select('id, rating, comment, created_at, profiles(first_name, last_name)')
        .eq('product_id', id)
        .order('created_at', { ascending: false }),
    ])

    if (!productData) { router.push('/shop'); return }
    setProduct(productData)
    setReviews(reviewsData ?? [])

    if (productData.seller_id) {
      const { data: sellerData } = await supabase
        .from('sellers')
        .select('id, store_name, verified')
        .eq('id', productData.seller_id)
        .single()
      if (sellerData) setSeller(sellerData)
    }

    setLoading(false)
  }, [id, router])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ── Admin check (separate effect so it fires after user loads) ───────────────
  useEffect(() => {
    if (!user) { setIsAdmin(false); return }
    const supabase = createClient()
    supabase.from('profiles').select('role').eq('id', user.id).single()
      .then(({ data }) => setIsAdmin(data?.role === 'admin'))
  }, [user])

  // ── Handlers ─────────────────────────────────────────────────────────────────
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

  const handleWhatsApp = () => {
    const productName = product.name || product.title || 'this product'
    const productUrl  = typeof window !== 'undefined' ? window.location.href : `https://gikomba.shop/product/${id}`
    const message = encodeURIComponent(
      `Hi! 👋 I'm interested in *${productName}* (KSh ${product.price?.toLocaleString()}) on gikomba.shop.\n\n${productUrl}\n\nIs it available?`
    )
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank')
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setReviewError(null)
    if (!user) { setReviewError('Please sign in to leave a review'); return }
    if (!reviewComment.trim()) { setReviewError('Please write a comment'); return }

    setSubmittingReview(true)
    const supabase = createClient()
    const { error } = await supabase.from('product_reviews').insert({
      product_id: id,
      user_id: user.id,
      rating: reviewRating,
      comment: reviewComment.trim(),
    })
    setSubmittingReview(false)

    if (error) {
      setReviewError(error.code === '23505' ? 'You have already reviewed this product.' : error.message)
      return
    }

    setReviewComment('')
    setReviewRating(5)
    setShowReviewForm(false)
    toast.success('Review submitted!')
    fetchAll()
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Delete this review?')) return
    setDeletingId(reviewId)
    const supabase = createClient()
    const { error } = await supabase.from('product_reviews').delete().eq('id', reviewId)
    if (!error) {
      setReviews(prev => prev.filter(r => r.id !== reviewId))
      toast.success('Review deleted')
    }
    setDeletingId(null)
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const inStock   = (product.stock ?? 1) > 0
  const lowStock  = inStock && (product.stock ?? 99) <= 5
  const inWishlist = isInWishlist(product.id)
  const fmtPrice  = (p: number) => `KSh ${p.toLocaleString()}`
  const discount  = product.original_price && product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : null

  // Compute real avg rating
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
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
                alt={product.name || product.title || 'Product'}
                fill priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className={cn('h-full w-full object-cover', !inStock && 'opacity-60 grayscale')}
              />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {!inStock  && <Badge className="bg-gray-600 text-white">Out of Stock</Badge>}
                {lowStock  && <Badge className="bg-orange-500 text-white">Only {product.stock} left!</Badge>}
                {discount  && <Badge className="bg-primary text-primary-foreground">{discount}% Off</Badge>}
              </div>
            </div>

            {/* Info */}
            <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {product.name || product.title}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {avgRating ? (
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={cn('h-4 w-4', i < Math.round(Number(avgRating)) ? 'fill-primary text-primary' : 'text-muted')} />
                    ))}
                    <span className="ml-1 text-sm text-muted-foreground">{avgRating} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">No reviews yet</span>
                )}
                <Badge variant="outline" className="capitalize">{product.category}</Badge>
              </div>

              {/* Price */}
              <div className="mt-6 flex items-baseline gap-4">
                <p className="text-3xl font-bold">{fmtPrice(product.price)}</p>
                {product.original_price && (
                  <p className="text-xl text-muted-foreground line-through">{fmtPrice(product.original_price)}</p>
                )}
              </div>

              <p className="mt-4 text-base text-muted-foreground leading-relaxed">{product.description}</p>

              {/* Stock */}
              <div className="mt-3">
                {inStock && !lowStock && <p className="text-sm text-green-600 font-medium">✓ In Stock – Ready to ship</p>}
                {lowStock  && <p className="text-sm text-orange-500 font-medium">⚡ Only {product.stock} left!</p>}
                {!inStock  && <p className="text-sm text-gray-500 font-medium">✗ Out of Stock</p>}
              </div>

              {/* Seller */}
              {seller && (
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Sold by</span>
                  <span className="font-medium text-foreground">{seller.store_name}</span>
                  {seller.verified && (
                    <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="h-3 w-3" />Verified
                    </span>
                  )}
                </div>
              )}

              {/* CTAs */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="flex-1 gap-2" onClick={handleAddToCart} disabled={adding || !inStock}>
                  {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-5 w-5" />}
                  {!inStock ? 'Out of Stock' : adding ? 'Adding…' : 'Add to Cart'}
                </Button>
                <Button size="lg" variant="outline" className="gap-2" onClick={handleToggleWishlist}>
                  <Heart className={cn('h-5 w-5', inWishlist && 'fill-primary text-primary')} />
                  {inWishlist ? 'Saved' : 'Wishlist'}
                </Button>
              </div>

              {/* WhatsApp Buy CTA */}
              <Button
                size="lg"
                className="mt-3 w-full gap-2 text-white font-semibold"
                style={{ backgroundColor: '#25D366' }}
                onClick={handleWhatsApp}
              >
                <MessageCircle className="h-5 w-5" />
                Buy via WhatsApp
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-1">
                Chat directly with the seller · Usually replies within minutes
              </p>

              {/* Trust badges */}
              <div className="mt-10 grid grid-cols-3 gap-4 border-t border-border pt-8">
                {[
                  { icon: Truck,       title: 'Fast Delivery',    sub: 'Within 24–48 hours' },
                  { icon: ShieldCheck, title: 'Secure Payment',   sub: 'M-Pesa & Card' },
                  { icon: RotateCcw,   title: 'Easy Returns',     sub: '7-day policy' },
                ].map(({ icon: Icon, title, sub }) => (
                  <div key={title} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0">
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

          {/* ── REVIEWS ── */}
          <div className="mt-16 border-t border-border pt-12">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h2 className="text-2xl font-bold">Customer Reviews</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {reviews.length === 0
                    ? 'No reviews yet — be the first!'
                    : `${reviews.length} review${reviews.length !== 1 ? 's' : ''} · Average ${avgRating} / 5`}
                </p>
              </div>
              {user && !showReviewForm && (
                <Button variant="outline" className="gap-2" onClick={() => setShowReviewForm(true)}>
                  <Star className="h-4 w-4" />Write a Review
                </Button>
              )}
            </div>

            {/* Write review form */}
            {showReviewForm && (
              <div className="mb-8 p-5 border rounded-xl bg-muted/20">
                <h3 className="font-semibold mb-4">Your Review</h3>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Rating</p>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(star => (
                        <button key={star} type="button" onClick={() => setReviewRating(star)}>
                          <Star className={cn('h-6 w-6 transition-colors', star <= reviewRating ? 'fill-primary text-primary' : 'text-muted hover:text-primary')} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Comment</p>
                    <Textarea
                      placeholder="Share your experience with this product..."
                      rows={4}
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                    />
                  </div>
                  {reviewError && (
                    <p className="text-sm text-destructive">{reviewError}</p>
                  )}
                  <div className="flex gap-3">
                    <Button type="submit" disabled={submittingReview} className="gap-2">
                      {submittingReview ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Submit Review
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowReviewForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Review list */}
            {reviews.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Star className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>No reviews yet.</p>
                {user && <p className="text-sm mt-1">Have this product? Leave the first review!</p>}
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map(review => {
                  const name = [review.profiles?.first_name, review.profiles?.last_name]
                    .filter(Boolean).join(' ') || 'Anonymous'
                  return (
                    <div key={review.id} className="border-b border-border pb-6 last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-semibold text-sm flex items-center justify-center flex-shrink-0">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(review.created_at).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </p>
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
                              onClick={() => handleDeleteReview(review.id)}
                              disabled={deletingId === review.id}
                              className="ml-2 text-muted-foreground hover:text-destructive transition-colors"
                              title="Delete review (admin)"
                            >
                              {deletingId === review.id
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
