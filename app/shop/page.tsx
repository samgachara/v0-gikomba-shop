"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import useSWR from "swr"
import { Heart, ShoppingBag, Star, Loader2, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import type { Product } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then(res => res.json())

const categories = [
  { value: "all", label: "All Categories" },
  { value: "women", label: "Women's Fashion" },
  { value: "men", label: "Men's Fashion" },
  { value: "electronics", label: "Electronics" },
  { value: "home", label: "Home & Living" },
  { value: "kids", label: "Kids" },
  { value: "accessories", label: "Accessories" },
]

function formatPrice(price: number): string {
  return `KSh ${price.toLocaleString()}`
}

function getDiscount(price: number, originalPrice: number | null): number | null {
  if (!originalPrice || originalPrice <= price) return null
  return Math.round(((originalPrice - price) / originalPrice) * 100)
}

export default function ShopPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialCategory = searchParams.get('category') || 'all'
  const initialFilter = searchParams.get('filter') || ''
  
  const [category, setCategory] = useState(initialCategory)
  const [searchQuery, setSearchQuery] = useState('')
  
  const apiUrl = category === 'all' 
    ? `/api/products${initialFilter === 'new' ? '?featured=true' : ''}`
    : `/api/products?category=${category}`
  
  const { data: products, isLoading } = useSWR<Product[]>(apiUrl, fetcher)
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart()
  const { user } = useAuth()

  const filteredProducts = products?.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddToCart = async (productId: string) => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    await addToCart(productId)
  }

  const handleToggleWishlist = async (productId: string) => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId)
    } else {
      await addToWishlist(productId)
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Page Header */}
        <div className="border-b border-border bg-secondary/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-foreground">Shop</h1>
            <p className="text-muted-foreground mt-2">
              Discover amazing deals on quality products
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredProducts?.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-6">No products found. Check back soon!</p>
              <Link href="/">
                <Button>Back to Homepage</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {filteredProducts?.map((product) => {
                const discount = getDiscount(product.price, product.original_price)
                const inWishlist = isInWishlist(product.id)
                
                return (
                  <div
                    key={product.id}
                    className="group relative flex flex-col overflow-hidden rounded-xl bg-card border border-border"
                  >
                    {/* Image Container */}
                    <Link href={`/product/${product.id}`} className="relative aspect-[3/4] overflow-hidden">
                      <img
                        src={product.image_url || 'https://via.placeholder.com/400x500'}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {product.is_new && (
                          <Badge className="bg-accent text-accent-foreground">New</Badge>
                        )}
                        {discount && (
                          <Badge variant="secondary" className="bg-primary text-primary-foreground">
                            {discount}% Off
                          </Badge>
                        )}
                      </div>
                    </Link>

                    {/* Wishlist Button */}
                    <button
                      onClick={() => handleToggleWishlist(product.id)}
                      className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-card/90 backdrop-blur transition-colors hover:bg-card z-10"
                    >
                      <Heart
                        className={cn(
                          "h-4 w-4 transition-colors",
                          inWishlist
                            ? "fill-primary text-primary"
                            : "text-muted-foreground"
                        )}
                      />
                    </button>

                    {/* Quick Add */}
                    <div className="absolute inset-x-3 bottom-[140px] opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 z-10">
                      <Button 
                        className="w-full gap-2" 
                        size="sm"
                        onClick={() => handleAddToCart(product.id)}
                      >
                        <ShoppingBag className="h-4 w-4" />
                        Add to Cart
                      </Button>
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col gap-2 p-4">
                      <Link href={`/product/${product.id}`}>
                        <h3 className="text-sm font-medium text-foreground line-clamp-1 hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                        <span className="text-xs text-muted-foreground">
                          {product.rating} ({product.review_count})
                        </span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold text-foreground">
                          {formatPrice(product.price)}
                        </span>
                        {product.original_price && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(product.original_price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
