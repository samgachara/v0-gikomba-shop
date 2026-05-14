import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/site'

export function generateShopMetadata(filter?: string, category?: string): Metadata {
  if (filter === 'new')
    return {
      title: 'New Arrivals — gikomba.shop',
      description: 'Shop the latest listings on gikomba.shop. Fresh stock from verified Kenyan sellers. M-Pesa payments, delivery to all 47 counties.',
      alternates: { canonical: `${SITE_URL}/shop?filter=new` },
    }
  if (filter === 'bestsellers')
    return {
      title: 'Best Sellers — gikomba.shop',
      description: 'Top-rated products on gikomba.shop. Most popular items from trusted sellers across Kenya.',
      alternates: { canonical: `${SITE_URL}/shop?filter=bestsellers` },
    }
  if (filter === 'sale')
    return {
      title: 'Sale & Discounts — gikomba.shop',
      description: 'Best deals on gikomba.shop. Discounted fashion, electronics and more from Kenyan sellers.',
      alternates: { canonical: `${SITE_URL}/shop?filter=sale` },
    }
  if (category) {
    const labels: Record<string, string> = {
      'Clothing':      'Clothing & Fashion',
      'Shoes':         'Shoes & Footwear',
      'Accessories':   'Bags & Accessories',
      'Electronics':   'Electronics & Gadgets',
      'Home & Living': 'Home & Living',
      'Sports':        'Sports & Fitness',
      'Beauty':        'Beauty & Personal Care',
      'Books':         'Books & Education',
      'Other':         'Other Products',
    }
    const label = labels[category] ?? category
    return {
      title: `${label} in Kenya — gikomba.shop`,
      description: `Buy ${label} online in Kenya on gikomba.shop. Quality products at honest prices. M-Pesa payments, verified sellers, delivery nationwide.`,
      alternates: { canonical: `${SITE_URL}/shop?category=${encodeURIComponent(category)}` },
    }
  }
  return {
    title: 'Shop Online in Kenya — gikomba.shop | M-Pesa Payments',
    description: 'Buy second-hand and new fashion, electronics, home goods and more from verified Kenyan sellers. M-Pesa payments, 7-day returns, delivery to all 47 counties.',
    keywords: 'online shopping Kenya, mitumba online, second hand Kenya, buy clothes online Kenya, M-Pesa shopping',
    alternates: { canonical: `${SITE_URL}/shop` },
  }
}
