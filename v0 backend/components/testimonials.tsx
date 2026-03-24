"use client"

import { Star } from "lucide-react"

const testimonials = [
  {
    id: 1,
    content: "Best prices I've found online! The quality is amazing and delivery to Mombasa was super fast. Will definitely shop here again.",
    author: "Amina Hassan",
    location: "Mombasa",
    rating: 5,
    avatar: "A",
  },
  {
    id: 2,
    content: "Finally, an online shop that understands Kenyans. M-Pesa checkout is seamless, and the clothes fit perfectly. Highly recommend!",
    author: "John Kamau",
    location: "Nairobi",
    rating: 5,
    avatar: "J",
  },
  {
    id: 3,
    content: "Ordered electronics and got them the next day. Customer service on WhatsApp was very helpful. Great experience overall!",
    author: "Grace Wanjiku",
    location: "Nakuru",
    rating: 5,
    avatar: "G",
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
            Join thousands of happy customers across the country
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="flex flex-col gap-4 rounded-xl bg-card p-6 shadow-sm"
            >
              {/* Stars */}
              <div className="flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground leading-relaxed flex-1">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author */}
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

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary sm:text-4xl">50K+</p>
            <p className="mt-1 text-sm text-muted-foreground">Happy Customers</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-primary sm:text-4xl">10K+</p>
            <p className="mt-1 text-sm text-muted-foreground">Products</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-primary sm:text-4xl">47</p>
            <p className="mt-1 text-sm text-muted-foreground">Counties Served</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-primary sm:text-4xl">4.9</p>
            <p className="mt-1 text-sm text-muted-foreground">Average Rating</p>
          </div>
        </div>
      </div>
    </section>
  )
}
