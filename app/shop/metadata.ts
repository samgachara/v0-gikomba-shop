import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/site'

export function generateShopMetadata(filter?: string, category?: string): Metadata {
  if (filter === 'new')
    return {
      title: 'New Arrivals',
      description:
        'Browse the latest products just added to Gikomba Shop. New arrivals from sellers across Kenya.',
      alternates: { canonical: `${SITE_URL}/shop?filter=new` },
      openGraph: { url: `${SITE_URL}/shop?filter=new` },
    }
  if (filter === 'bestsellers')
    return {
      title: 'Best Sellers',
      description: 'Shop the most popular products on Gikomba Shop. Top-rated items from trusted Kenyan sellers.',
      alternates: { canonical: `${SITE_URL}/shop?filter=bestsellers` },
      openGraph: { url: `${SITE_URL}/shop?filter=bestsellers` },
    }
  if (filter === 'sale')
    return {
      title: 'Sale',
      description: 'Great deals and discounts on Gikomba Shop. Save on fashion, electronics, home goods and more.',
      alternates: { canonical: `${SITE_URL}/shop?filter=sale` },
      openGraph: { url: `${SITE_URL}/shop?filter=sale` },
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
      title: label,
      description: `Shop ${label} on Gikomba Shop. Quality products at unbeatable prices, delivered across Kenya.`,
      alternates: { canonical: `${SITE_URL}/shop?category=${category}` },
      openGraph: { url: `${SITE_URL}/shop?category=${category}` },
    }
  }
  return {
    title: 'Shop',
    description: 'Browse thousands of products from trusted sellers across Kenya. Fashion, electronics, home goods and more.',
    alternates: { canonical: `${SITE_URL}/shop` },
    openGraph: { url: `${SITE_URL}/shop` },
  }
}
