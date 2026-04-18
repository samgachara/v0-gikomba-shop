import Link from "next/link"
import Image from "next/image"

const categories = [
  {
    name: "Women's Fashion",
    href: "/shop?category=women",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=533&fit=crop",
    count: "2,500+ Products",
  },
  {
    name: "Men's Fashion",
    href: "/shop?category=men",
    image: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=400&h=533&fit=crop",
    count: "1,800+ Products",
  },
  {
    name: "Electronics",
    href: "/shop?category=electronics",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=533&fit=crop",
    count: "1,200+ Products",
  },
  {
    name: "Home & Living",
    href: "/shop?category=home",
    image: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400&h=533&fit=crop",
    count: "950+ Products",
  },
  {
    name: "Kids & Baby",
    href: "/shop?category=kids",
    image: "https://images.unsplash.com/photo-1519704943920-18447022ad75?w=400&h=533&fit=crop",
    count: "600+ Products",
  },
  {
    name: "Accessories",
    href: "/shop?category=accessories",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=533&fit=crop",
    count: "1,100+ Products",
  },
]

export function Categories() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Shop by Category
            </h2>
            <p className="text-muted-foreground mt-2">
              Explore our wide range of products across different categories
            </p>
          </div>
          <Link
            href="/shop"
            className="text-sm font-semibold text-primary hover:text-primary/80"
          >
            View all categories <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-card"
            >
              <Image
                src={category.image}
                alt={category.name}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
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
