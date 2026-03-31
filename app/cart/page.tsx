'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { Header } from '@/components/header'

function formatPrice(price: number): string {
  return `KSh ${price.toLocaleString()}`
}

export default function CartPage() {
  const { cart, cartLoading, cartTotal, updateCartItem, removeFromCart } = useCart()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  // Track which item is currently being updated/removed
  const [pendingId, setPendingId] = useState<string | null>(null)

  const handleUpdateQty = async (id: string, quantity: number) => {
    setPendingId(id)
    await updateCartItem(id, quantity)
    setPendingId(null)
  }

  const handleRemove = async (id: string) => {
    setPendingId(id)
    await removeFromCart(id)
    setPendingId(null)
  }

  if (authLoading || cartLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background py-8">
          <div className="mx-auto max-w-4xl px-4">
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </main>
      </>
    )
  }

  if (!user) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background py-8">
          <div className="mx-auto max-w-4xl px-4 text-center py-20">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Sign in to view your cart</h1>
            <p className="text-muted-foreground mb-6">
              Please sign in to manage your shopping cart
            </p>
            <Button asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </main>
      </>
    )
  }

  if (cart.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background py-8">
          <div className="mx-auto max-w-4xl px-4 text-center py-20">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">
              Start shopping to add items to your cart
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

          <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => {
                const isPending = pendingId === item.id
                return (
                  <Card key={item.id} className={isPending ? 'opacity-60' : ''}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                          <img
                            src={item.product?.image_url || 'https://via.placeholder.com/100'}
                            alt={item.product?.name || ''}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="flex flex-1 flex-col">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-medium">{item.product?.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {formatPrice(item.product?.price || 0)} each
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleRemove(item.id)}
                              disabled={isPending}
                            >
                              {isPending ? (
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
                                onClick={() =>
                                  handleUpdateQty(item.id, Math.max(1, item.quantity - 1))
                                }
                                disabled={item.quantity <= 1 || isPending}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  handleUpdateQty(item.id, item.quantity + 1)
                                }
                                disabled={isPending}
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
                <CardFooter>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => router.push('/checkout')}
                  >
                    Proceed to Checkout
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
