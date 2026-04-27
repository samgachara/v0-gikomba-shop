import { Suspense } from "react"
import { Header } from "@/components/header"
import { ShopProducts } from "@/components/shop-products"

export default function ShopPage() {
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

        <Suspense fallback={<div className="flex items-center justify-center py-20"><div>Loading...</div></div>}>
          <ShopProducts />
        </Suspense>
      </main>
    </>
  )
}
