// app/account/orders/page.tsx
"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { User, Package, Heart, LogOut, Loader2, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import type { Order, ApiResponse } from "@/lib/types"

// Update fetcher to correctly unwrap the ApiResponse
const fetcher = (url: string) => fetch(url).then(async res => {
  if (res.status === 401) return { success: false, error: "Unauthorized", data: [] } as ApiResponse<Order[]>;
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || "An error occurred");
  }
  return json as ApiResponse<Order[]>;
});

function formatPrice(price: number): string {
  return `KSh ${price.toLocaleString()}`
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function getStatusColor(status: string) {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    case "confirmed":
      return "bg-blue-100 text-blue-800"
    case "shipped":
      return "bg-purple-100 text-purple-800"
    case "delivered":
      return "bg-green-100 text-green-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function OrdersPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  // Use the updated fetcher and correctly access data.data
  const { data: apiResponse, isLoading } = useSWR<ApiResponse<Order[]>>("/api/orders", fetcher)
  const orders = apiResponse?.data || []

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, authLoading, router])

  if (authLoading || isLoading) {
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
    return null
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-8">
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="text-3xl font-bold mb-8">My Orders</h1>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <Card>
                <CardContent className="p-4">
                  <nav className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                      <Link href="/account">
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                    </Button>
                    <Button variant="secondary" className="w-full justify-start gap-2" asChild>
                      <Link href="/account/orders">
                        <Package className="h-4 w-4" />
                        Orders
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                      <Link href="/wishlist">
                        <Heart className="h-4 w-4" />
                        Wishlist
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                      onClick={signOut}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Orders List */}
            <div className="md:col-span-2 space-y-4">
              {!orders || orders.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">No orders yet</p>
                    <p className="text-muted-foreground mb-4">
                      Start shopping to see your orders here
                    </p>
                    <Button asChild>
                      <Link href="/shop">Browse Products</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                orders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Order #{order.id.slice(0, 8)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {order.items?.map((item) => (
                          <div key={item.id} className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded bg-muted overflow-hidden">
                              <img
                                src={item.product?.image_url || "https://via.placeholder.com/50"}
                                alt={item.product?.name || ""}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{item.product?.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Qty: {item.quantity} x {formatPrice(item.price)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t flex justify-between items-center">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {order.shipping_city}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Payment: {order.payment_method === "mpesa" ? "M-Pesa" : "Card"} - {order.payment_status}
                          </p>
                        </div>
                        <p className="font-semibold">{formatPrice(order.total)}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
