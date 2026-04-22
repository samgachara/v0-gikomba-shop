"use client"

import { Star } from "lucide-react"

const testimonials = [
  {
    id: 1,
    content: "Best prices I've found online! The quality is amazing and delivery was super fast. M-Pesa checkout made everything so easy. Will definitely shop here again.",
    author: "Early Customer",
    location: "Mombasa",
    rating: 5,
    avatar: "★",
  },
  {
    id: 2,
    content: "Finally, an online shop that understands Kenyans. Seamless checkout and the products were exactly as described. Highly recommend!",
    author: "Early Customer",
    location: "Nairobi",
    rating: 5,
    avatar: "★",
  },
  {
    id: 3,
    content: "Great experience from start to finish. Customer support on WhatsApp was very responsive and my order arrived on time.",
    author: "Early Customer",
    location: "Nakuru",
    rating: 5,
    avatar: "★",
  },
]

export function Testimonials() {
  return (
    <section className="py-16 sm:py-24 bg-secondary">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Loved by Kenyans
          </h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Real stories from our early customers
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="flex flex-col gap-4 rounded-xl bg-card p-6 shadow-sm"
            >
              <div className="flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-foreground leading-relaxed flex-1">
                &ldquo;{testimonial.content}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-medium text-foreground">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Honest trust signals — no fake numbers */}
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
