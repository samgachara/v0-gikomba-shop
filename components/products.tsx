"use client"

import { useState } from "react"
import { Heart, ShoppingBag, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const products = [
  {
    id: 1,
    name: "Vintage Denim Jacket",
    price: 2500,
    originalPrice: 4500,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop",
    rating: 4.8,
    reviews: 124,
    badge: "Best Seller",
    isNew: false,
  },
  {
    id: 2,
    name: "Ankara Print Dress",
    price: 1800,
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1590400516695-36bdc0b5c7d8?w=400&h=500&fit=crop",
    rating: 4.9,
    reviews: 89,
    badge: null,
    isNew: true,
  },
  {
    id: 3,
    name: "Leather Crossbody Bag",
    price: 3200,
    originalPrice: 5000,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=500&fit=crop",
    rating: 4.7,
    reviews: 56,
    badge: "36% Off",
    isNew: false,
  },
  {
    id: 4,
    name: "Canvas Sneakers",
    price: 1500,
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&h=500&fit=crop",
    rating: 4.6,
    reviews: 203,
    badge: null,
    isNew: false,
  },
  {
    id: 5,
    name: "Maasai Beaded Necklace",
    price: 800,
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=500&fit=crop",
    rating: 5.0,
    reviews: 45,
    badge: null,
    isNew: true,
  },
  {
    id: 6,
    name: "Wireless Earbuds",
    price: 2800,
    originalPrice: 4000,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=500&fit=crop",
    rating: 4.5,
    reviews: 312,
    badge: "30% Off",
    isNew: false,
  },
  {
    id: 7,
    name: "Cotton Kikoi Shirt",
    price: 1200,
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop",
    rating: 4.8,
    reviews: 78,
    badge: null,
    isNew: false,
  },
  {
    id: 8,
    name: "Smart Watch Band",
    price: 650,
    originalPrice: 1000,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop",
    rating: 4.4,
    reviews: 167,
    badge: "35% Off",
    isNew: false,
  },
]

function formatPrice(price: number): string {
  return `KSh ${price.toLocaleString()}`
}

export function Products() {
  const [wishlist, setWishlist] = useState<number[]>([])

  const toggleWishlist = (id: number) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  return (
    <section id="shop" className="py-16 sm:py-24 bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Trending Now
            </h2>
            <p className="text-muted-foreground text-lg mt-2">
              Most popular items this week
            </p>
          </div>
          <Button variant="outline" className="w-fit">
            View All Products
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group relative flex flex-col overflow-hidden rounded-xl bg-card"
            >
              {/* Image Container */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {product.isNew && (
                    <Badge className="bg-accent text-accent-foreground">New</Badge>
                  )}
                  {product.badge && (
                    <Badge variant="secondary" className="bg-primary text-primary-foreground">
                      {product.badge}
                    </Badge>
                  )}
                </div>

                {/* Wishlist Button */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-card/90 backdrop-blur transition-colors hover:bg-card"
                >
                  <Heart
                    className={cn(
                      "h-4 w-4 transition-colors",
                      wishlist.includes(product.id)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    )}
                  />
                </button>

                {/* Quick Add */}
                <div className="absolute inset-x-3 bottom-3 opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                  <Button className="w-full gap-2" size="sm">
                    <ShoppingBag className="h-4 w-4" />
                    Add to Cart
                  </Button>
                </div>
              </div>

              {/* Product Info */}
              <div className="flex flex-col gap-2 p-4">
                <h3 className="text-sm font-medium text-foreground line-clamp-1">
                  {product.name}
                </h3>
                
                {/* Rating */}
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                  <span className="text-xs text-muted-foreground">
                    {product.rating} ({product.reviews})
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-foreground">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
