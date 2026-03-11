"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Heart, ShoppingBag, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"

function formatPrice(price: number): string {
  return `KSh ${price.toLocaleString()}`
}

export default function WishlistPage() {
  const { wishlist, wishlistLoading, addToCart, removeFromWishlist } = useCart()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  if (authLoading || wishlistLoading) {
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

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId)
    await removeFromWishlist(productId)
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-8">
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>

          {wishlist.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
                <p className="text-muted-foreground mb-6">
                  Save items you love by clicking the heart icon on any product
                </p>
                <Button asChild>
                  <Link href="/shop">Browse Products</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {wishlist.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <Link href={`/product/${item.product_id}`}>
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={item.product?.image_url || 'https://via.placeholder.com/300'}
                        alt={item.product?.name || ''}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                  </Link>
                  <CardContent className="p-4">
                    <Link href={`/product/${item.product_id}`}>
                      <h3 className="font-medium hover:text-primary transition-colors line-clamp-1">
                        {item.product?.name}
                      </h3>
                    </Link>
                    <p className="text-lg font-semibold mt-1">
                      {formatPrice(item.product?.price || 0)}
                    </p>
                    <div className="flex gap-2 mt-4">
                      <Button 
                        className="flex-1 gap-2" 
                        size="sm"
                        onClick={() => handleAddToCart(item.product_id)}
                      >
                        <ShoppingBag className="h-4 w-4" />
                        Add to Cart
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFromWishlist(item.product_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
