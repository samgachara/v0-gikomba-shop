"use client"

import { Truck, Shield, Headphones, CreditCard } from "lucide-react"

const features = [
  {
    icon: Truck,
    title: "Nationwide Delivery",
    description: "Fast delivery to all 47 counties. Same-day delivery available in Nairobi.",
  },
  {
    icon: Shield,
    title: "Quality Guaranteed",
    description: "Every item is inspected. Easy returns within 7 days if not satisfied.",
  },
  {
    icon: CreditCard,
    title: "M-Pesa Payments",
    description: "Pay easily with M-Pesa, Airtel Money, or card. Buy Now, Pay Later available.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Chat with us on WhatsApp anytime. We respond within minutes.",
  },
]

export function Features() {
  return (
    <section className="py-16 sm:py-20 bg-background border-y border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="flex flex-col items-center text-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
