"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, CreditCard, Smartphone, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { ProtectedRoute } from "@/components/protected-route"
import { toast } from "sonner"
import type { ApiResponse, } from "@/lib/api-utils"
import type { Order } from "@/lib/types"

function formatPrice(price: number): string {
  return `KSh ${price.toLocaleString()}`
}

// Phone validation for Kenya
function validatePhone(phone: string): { valid: boolean; message?: string } {
  const cleaned = phone.replace(/\s/g, '')
  const regex = /^(\+254|254|0)?[71]\d{8}$/
  if (!regex.test(cleaned)) {
    return { valid: false, message: 'Please enter a valid Kenyan phone number (e.g., +254 7XX XXX XXX)' }
  }
  return { valid: true }
}

function CheckoutContent() {
  const { cart, cartTotal, cartLoading, clearCart, refreshCart } = useCart()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    city: 'Nairobi',
    paymentMethod: 'mpesa',
  })

  const deliveryFee = 250
  const total = cartTotal + deliveryFee

  // Redirect to cart if empty (using useEffect to avoid redirect during render)
  useEffect(() => {
    if (!cartLoading && !authLoading && cart.length === 0 && !success) {
      router.push('/cart')
    }
  }, [cart.length, cartLoading, authLoading, success, router])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Phone validation
    const phoneResult = validatePhone(formData.phone)
    if (!phoneResult.valid) {
      newErrors.phone = phoneResult.message || 'Invalid phone number'
    }

    // Address validation
    if (formData.address.trim().length < 5) {
      newErrors.address = 'Please enter a valid delivery address'
    }

    // City validation
    if (formData.city.trim().length < 2) {
      newErrors.city = 'Please enter a valid city'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipping_address: formData.address.trim(),
          shipping_city: formData.city.trim(),
          phone: formData.phone.replace(/\s/g, ''),
          payment_method: formData.paymentMethod,
        }),
      })

      const json: ApiResponse<Order> = await res.json()

      if (!res.ok || !json.success) {
        toast.error('Order failed', {
          description: json.error || 'Please try again',
        })
        setLoading(false)
        return
      }

      const order = json.data
      if (order) {
        setOrderId(order.id)
        setSuccess(true)
        clearCart()
        toast.success('Order placed successfully!')
      }
    } catch {
      toast.error('Failed to place order', {
        description: 'Please check your connection and try again',
      })
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (cartLoading || authLoading) {
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

  // Empty cart state
  if (cart.length === 0 && !success) {
    return null // Will redirect in useEffect
  }

  // Success state
  if (success) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background py-8">
          <div className="mx-auto max-w-lg px-4 text-center py-20">
            <div className="mx-auto w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-10 w-10 text-accent" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Order Placed Successfully!</h1>
            <p className="text-muted-foreground mb-2">
              Thank you for shopping with gikomba.shop
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Order ID: <span className="font-mono">{orderId?.slice(0, 8)}</span>
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              {formData.paymentMethod === 'mpesa' 
                ? 'You will receive an M-Pesa payment prompt shortly. Once payment is confirmed, your order will be processed.'
                : 'Your order is being processed and will be shipped soon.'}
            </p>
            <div className="flex flex-col gap-3">
              <Button asChild>
                <Link href="/account/orders">View My Orders</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/shop">Continue Shopping</Link>
              </Button>
            </div>
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
          <Button variant="ghost" className="mb-6 gap-2" asChild>
            <Link href="/cart">
              <ArrowLeft className="h-4 w-4" />
              Back to Cart
            </Link>
          </Button>

          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Checkout Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Delivery Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Delivery Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number (M-Pesa)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+254 7XX XXX XXX"
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData({ ...formData, phone: e.target.value })
                          if (errors.phone) {
                            setErrors({ ...errors, phone: '' })
                          }
                        }}
                        className={errors.phone ? 'border-destructive' : ''}
                        required
                      />
                      {errors.phone && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.phone}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Delivery Address</Label>
                      <Input
                        id="address"
                        placeholder="Street address, building, floor"
                        value={formData.address}
                        onChange={(e) => {
                          setFormData({ ...formData, address: e.target.value })
                          if (errors.address) {
                            setErrors({ ...errors, address: '' })
                          }
                        }}
                        className={errors.address ? 'border-destructive' : ''}
                        required
                      />
                      {errors.address && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.address}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) => {
                          setFormData({ ...formData, city: e.target.value })
                          if (errors.city) {
                            setErrors({ ...errors, city: '' })
                          }
                        }}
                        className={errors.city ? 'border-destructive' : ''}
                        required
                      />
                      {errors.city && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.city}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={formData.paymentMethod}
                      onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50">
                        <RadioGroupItem value="mpesa" id="mpesa" />
                        <Label htmlFor="mpesa" className="flex items-center gap-3 cursor-pointer flex-1">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                            <Smartphone className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">M-Pesa</p>
                            <p className="text-sm text-muted-foreground">Pay with M-Pesa mobile money</p>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                            <CreditCard className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">Card Payment</p>
                            <p className="text-sm text-muted-foreground">Visa, Mastercard accepted</p>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Items */}
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {cart.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground truncate flex-1 mr-2">
                            {item.product?.name} x {item.quantity}
                          </span>
                          <span className="flex-shrink-0">{formatPrice((item.product?.price || 0) * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <Separator />
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
                    <Button type="submit" className="w-full" size="lg" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        `Pay ${formatPrice(total)}`
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutContent />
    </ProtectedRoute>
  )
}
