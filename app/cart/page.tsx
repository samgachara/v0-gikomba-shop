'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Loader2, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
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

  const handleCheckout = () => {
    if (!user) {
      router.push('/auth/login?redirectTo=/checkout')
      return
    }
    router.push('/checkout')
  }

  // Still loading
  if (authLoading || cartLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background py-8">
          <div className="mx-auto max-w-4xl px-4 flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </>
    )
  }

  // Not logged in — show guest cart view (cart is empty since items are server-side)
  if (!user) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background py-8">
          <div className="mx-auto max-w-4xl px-4">
            <div className="flex items-center gap-4 mb-8">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold">Your Cart</h1>
            </div>
            <div className="text-center py-20">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Sign in to see items you&apos;ve added, or start shopping and sign in at checkout.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild>
                  <Link href="/shop">Continue Shopping</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/auth/login?redirectTo=/cart">
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </main>
      </>
    )
  }

  // Logged in, empty cart
  if (cart.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background py-8">
          <div className="mx-auto max-w-4xl px-4 text-center py-20">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">Add some products to get started!</p>
            <Button asChild>
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-8">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Your Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                        {item.product?.image_url && (
                          <img src={item.product.image_url} alt={item.product?.name} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col gap-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-sm line-clamp-2">{item.product?.name}</h3>
                            <p className="text-xs text-muted-foreground capitalize">{item.product?.category}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemove(item.id)}
                            disabled={pendingId === item.id}
                          >
                            {pendingId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center border border-border rounded-md">
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-r-none" onClick={() => handleUpdateQty(item.id, item.quantity - 1)} disabled={item.quantity <= 1 || pendingId === item.id}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-l-none" onClick={() => handleUpdateQty(item.id, item.quantity + 1)} disabled={pendingId === item.id}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="font-semibold text-sm">{formatPrice((item.product?.price ?? 0) * item.quantity)}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="text-green-600">Calculated at checkout</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  <Button className="w-full" size="lg" onClick={handleCheckout}>
                    Proceed to Checkout
                  </Button>
                  <div className="w-full grid grid-cols-3 gap-2 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm">🔒</span>
                      <span className="text-xs text-muted-foreground">Secure Pay</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm">✅</span>
                      <span className="text-xs text-muted-foreground">Buyer Protection</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm">↩️</span>
                      <span className="text-xs text-muted-foreground">7-Day Returns</span>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
