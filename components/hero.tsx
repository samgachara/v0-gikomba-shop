"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ArrowRight, Truck, Shield, CreditCard } from "lucide-react"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background pt-16 pb-24 sm:pt-24 sm:pb-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="sm:text-center md:mx-auto md:max-w-2xl lg:col-span-6 lg:text-left">
            {/* Clickable "New Season Arrival" badge → new arrivals */}
            <Link href="/shop?filter=new" className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary ring-1 ring-inset ring-primary/20 hover:bg-primary/20 transition-colors">
              New Season Arrival →
            </Link>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Kenya&apos;s Favorite <span className="text-primary">Online Marketplace</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Discover quality products from trusted sellers across Kenya. From fashion to electronics,
              get everything you need delivered to your doorstep at unbeatable prices.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 sm:justify-center lg:justify-start">
              <Button size="lg" className="w-full sm:w-auto gap-2" asChild>
                <Link href="/shop">
                  Shop Now <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                <Link href="/auth/sign-up">Become a Seller</Link>
              </Button>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-4 border-t border-border pt-8">
              <div className="flex flex-col items-center lg:items-start gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Truck className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center lg:items-start gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Shield className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">Secure Pay</span>
              </div>
              <div className="flex flex-col items-center lg:items-start gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CreditCard className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">Best Prices</span>
              </div>
            </div>
          </div>

          <div className="relative mt-12 sm:mx-auto sm:max-w-lg lg:col-span-6 lg:mx-0 lg:mt-0 lg:flex lg:items-center">
            <div className="relative mx-auto w-full rounded-2xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  {/* Clickable fashion image → women's fashion */}
                  <Link href="/shop?category=women" className="block aspect-[3/4] rounded-2xl bg-card overflow-hidden shadow-lg relative group">
                    <Image
                      src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=533&fit=crop"
                      alt="Fashion collection"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </Link>
                  {/* Clickable "50% OFF TODAY" banner → sale page */}
                  <Link href="/shop?filter=sale" className="block aspect-square rounded-2xl bg-primary flex items-center justify-center p-6 hover:bg-primary/90 transition-colors">
                    <div className="text-center text-primary-foreground">
                      <p className="text-4xl font-bold">50%</p>
                      <p className="text-sm font-medium">OFF TODAY</p>
                      <p className="text-xs mt-1 underline">Shop Sale →</p>
                    </div>
                  </Link>
                </div>
                <div className="space-y-4 pt-8">
                  {/* Clickable accessories image */}
                  <Link href="/shop?category=accessories" className="block aspect-square rounded-2xl bg-card overflow-hidden shadow-lg relative group">
                    <Image
                      src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop"
                      alt="Accessories"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </Link>
                  {/* Clickable clothing image → new arrivals */}
                  <Link href="/shop?filter=new" className="block aspect-[3/4] rounded-2xl bg-card overflow-hidden shadow-lg relative group">
                    <Image
                      src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=533&fit=crop"
                      alt="Clothing"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
