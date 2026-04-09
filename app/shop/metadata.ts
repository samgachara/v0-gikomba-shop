import type { Metadata } from 'next'

export function generateShopMetadata(filter?: string, category?: string): Metadata {
  if (filter === 'new') return {
    title: 'New Arrivals | Gikomba Shop',
    description: 'Browse the latest products just added to Gikomba Shop. New arrivals from sellers across Kenya.',
  }
  if (filter === 'bestsellers') return {
    title: 'Best Sellers | Gikomba Shop',
    description: 'Shop the most popular products on Gikomba Shop. Top-rated items from trusted Kenyan sellers.',
  }
  if (filter === 'sale') return {
    title: 'Sale | Gikomba Shop',
    description: 'Great deals and discounts on Gikomba Shop. Save on fashion, electronics, home goods and more.',
  }
  if (category) {
    const labels: Record<string, string> = {
      women: "Women's Fashion",
      men: "Men's Fashion",
      electronics: 'Electronics',
      home: 'Home & Living',
      kids: 'Kids & Baby',
      accessories: 'Accessories',
    }
    const label = labels[category] ?? category
    return {
      title: `${label} | Gikomba Shop`,
      description: `Shop ${label} on Gikomba Shop. Quality products at unbeatable prices, delivered across Kenya.`,
    }
  }
  return {
    title: 'Shop | Gikomba Shop',
    description: 'Browse thousands of products from trusted sellers across Kenya. Fashion, electronics, home goods and more.',
  }
}
