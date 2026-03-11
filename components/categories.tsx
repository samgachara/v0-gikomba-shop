"use client"

import Link from "next/link"

const categories = [
  {
    name: "Women's Fashion",
    count: "2,400+ items",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=500&fit=crop",
    href: "#women",
  },
  {
    name: "Men's Fashion",
    count: "1,800+ items",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
    href: "#men",
  },
  {
    name: "Electronics",
    count: "800+ items",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=500&fit=crop",
    href: "#electronics",
  },
  {
    name: "Home & Living",
    count: "1,200+ items",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=500&fit=crop",
    href: "#home",
  },
  {
    name: "Kids & Baby",
    count: "900+ items",
    image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=500&fit=crop",
    href: "#kids",
  },
  {
    name: "Accessories",
    count: "1,500+ items",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop",
    href: "#accessories",
  },
]

export function Categories() {
  return (
    <section id="categories" className="py-16 sm:py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Shop by Category
          </h2>
          <p className="text-muted-foreground text-lg">
            Find exactly what you need from our wide selection
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-card"
            >
              <img
                src={category.image}
                alt={category.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 className="text-sm font-semibold text-card sm:text-base">{category.name}</h3>
                <p className="text-xs text-card/80">{category.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
