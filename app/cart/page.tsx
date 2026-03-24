"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"

function formatPrice(price: number): string {
  return `KSh ${price.toLocaleString()}`
}

// Cart item skeleton for loading state
function CartItemSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Skeleton className="h-24 w-24 rounded-lg flex-shrink-0" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
            <div className="mt-auto flex items-center justify-between">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function CartPage() {
  const { cart, cartLoading, cartTotal, updateCartItem, removeFromCart } = useCart()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set())

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    setUpdatingItems(prev => new Set(prev).add(itemId))
    await updateCartItem(itemId, newQuantity)
    setUpdatingItems(prev => {
      const next = new Set(prev)
      next.delete(itemId)
      return next
    })
  }

  const handleRemoveItem = async (itemId: string) => {
    setRemovingItems(prev => new Set(prev).add(itemId))
    await removeFromCart(itemId)
    setRemovingItems(prev => {
      const next = new Set(prev)
      next.delete(itemId)
      return next
    })
  }

  // Loading state
  if (authLoading || cartLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background py-8">
          <div className="mx-auto max-w-4xl px-4">
            <Skeleton className="h-10 w-40 mb-6" />
            <Skeleton className="h-10 w-48 mb-8" />
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <CartItemSkeleton key={i} />
                ))}
              </div>
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Separator />
                    <Skeleton className="h-6 w-full" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-12 w-full" />
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </>
    )
  }

  // Not signed in state
  if (!user) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background py-8">
          <div className="mx-auto max-w-4xl px-4 text-center py-20">
            <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Sign in to view your cart</h1>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Please sign in to manage your shopping cart and continue shopping
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/auth/sign-up">Create Account</Link>
              </Button>
            </div>
          </div>
        </main>
      </>
    )
  }

  // Empty cart state
  if (cart.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background py-8">
          <div className="mx-auto max-w-4xl px-4 text-center py-20">
            <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Looks like you have not added anything to your cart yet. Start shopping to find great deals!
            </p>
            <Button asChild>
              <Link href="/shop">Browse Products</Link>
            </Button>
          </div>
        </main>
      </>
    )
  }

  const deliveryFee = 250
  const total = cartTotal + deliveryFee

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-8">
        <div className="mx-auto max-w-4xl px-4">
          <Button variant="ghost" className="mb-6 gap-2" asChild>
            <Link href="/shop">
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>

          <h1 className="text-3xl font-bold mb-8">
            Shopping Cart 
            <span className="text-muted-foreground font-normal text-xl ml-2">
              ({cart.length} {cart.length === 1 ? 'item' : 'items'})
            </span>
          </h1>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => {
                const isUpdating = updatingItems.has(item.id)
                const isRemoving = removingItems.has(item.id)
                const maxQuantity = item.product?.stock || 10

                return (
                  <Card key={item.id} className={isRemoving ? 'opacity-50' : ''}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <Link 
                          href={`/product/${item.product_id}`}
                          className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted"
                        >
                          <img
                            src={item.product?.image_url || 'https://via.placeholder.com/100'}
                            alt={item.product?.name || ''}
                            className="h-full w-full object-cover transition-opacity hover:opacity-80"
                          />
                        </Link>
                        <div className="flex flex-1 flex-col">
                          <div className="flex justify-between">
                            <div>
                              <Link 
                                href={`/product/${item.product_id}`}
                                className="font-medium hover:text-primary transition-colors"
                              >
                                {item.product?.name}
                              </Link>
                              <p className="text-sm text-muted-foreground">
                                {formatPrice(item.product?.price || 0)} each
                              </p>
                              {item.product && item.product.stock <= 5 && item.product.stock > 0 && (
                                <p className="text-xs text-destructive mt-1">
                                  Only {item.product.stock} left in stock
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={isRemoving}
                              aria-label="Remove item"
                            >
                              {isRemoving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1 || isUpdating}
                                aria-label="Decrease quantity"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center font-medium">
                                {isUpdating ? (
                                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                ) : (
                                  item.quantity
                                )}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= maxQuantity || isUpdating}
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <span className="font-semibold">
                              {formatPrice((item.product?.price || 0) * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>{formatPrice(deliveryFee)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  <Button className="w-full" size="lg" onClick={() => router.push('/checkout')}>
                    Proceed to Checkout
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Secure checkout. Pay with M-Pesa or Card.
                  </p>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
