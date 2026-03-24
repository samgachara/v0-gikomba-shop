"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Truck, Shield, CreditCard } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-secondary">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Content */}
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 w-fit">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">New Collection Live</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
              Affordable Style,{" "}
              <span className="text-primary">Kenyan Pride</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              Discover quality fashion, electronics, and home essentials at prices that make sense. 
              From Gikomba to your doorstep, nationwide delivery with M-Pesa.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="gap-2 text-base">
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="text-base">
                Browse Categories
              </Button>
            </div>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="h-5 w-5 text-primary" />
                <span>Countrywide Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-5 w-5 text-primary" />
                <span>Quality Guaranteed</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-5 w-5 text-primary" />
                <span>Pay with M-Pesa</span>
              </div>
            </div>
          </div>

          {/* Hero Image Grid */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="aspect-[3/4] rounded-2xl bg-card overflow-hidden shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=533&fit=crop"
                    alt="Fashion collection"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="aspect-square rounded-2xl bg-primary flex items-center justify-center p-6">
                  <div className="text-center text-primary-foreground">
                    <p className="text-4xl font-bold">50%</p>
                    <p className="text-sm">Off Selected Items</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="aspect-square rounded-2xl bg-card overflow-hidden shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop"
                    alt="Accessories"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="aspect-[3/4] rounded-2xl bg-card overflow-hidden shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=533&fit=crop"
                    alt="Clothing"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
