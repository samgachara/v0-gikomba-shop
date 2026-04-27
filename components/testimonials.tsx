"use client"
import { Star } from "lucide-react"

export function Testimonials() {
  return (
    <section className="py-16 sm:py-24 bg-secondary">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Loved by Kenyans
          </h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Be the first to shop and share your experience
          </p>
        </div>

        {/* Empty state — shown until real reviews exist */}
        <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl bg-card text-center">
          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-6 w-6 text-muted-foreground/30" />
            ))}
          </div>
          <p className="text-lg font-medium text-foreground mb-2">No reviews yet</p>
          <p className="text-muted-foreground text-sm max-w-sm">
            Our first customers will appear here. Shop today and be the first to leave a review!
          </p>
        </div>

        {/* Trust signals */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="text-center p-6 rounded-xl bg-card">
            <p className="text-3xl font-bold text-primary sm:text-4xl">M-Pesa</p>
            <p className="mt-1 text-sm text-muted-foreground">Seamless payments</p>
          </div>
          <div className="text-center p-6 rounded-xl bg-card">
            <p className="text-3xl font-bold text-primary sm:text-4xl">47</p>
            <p className="mt-1 text-sm text-muted-foreground">Counties we deliver to</p>
          </div>
          <div className="text-center p-6 rounded-xl bg-card">
            <p className="text-3xl font-bold text-primary sm:text-4xl">24–48h</p>
            <p className="mt-1 text-sm text-muted-foreground">Typical delivery time</p>
          </div>
        </div>
      </div>
    </section>
  )
}
