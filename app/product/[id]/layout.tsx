// app/product/[id]/layout.tsx
// This is a SERVER component — do NOT add 'use client'
// It generates dynamic OpenGraph metadata so WhatsApp/Twitter/Facebook
// show the actual product image and name when someone shares a product link.

import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ id: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params

  try {
    const supabase = await createClient()
    const { data: product } = await supabase
      .from('products')
      .select('name, description, price, image_url, category')
      .eq('id', id)
      .single()

    if (!product) {
      return {
        title: 'Product | Gikomba Shop',
        description: "Shop quality products on Kenya's trusted online marketplace.",
      }
    }

    const title   = `${product.name} – KSh ${product.price?.toLocaleString()} | Gikomba Shop`
    const desc    = product.description
      ?? `Buy ${product.name} on Gikomba Shop. Quality ${product.category ?? 'products'} with M-Pesa payments and delivery across Kenya.`
    const imageUrl = product.image_url ?? 'https://gikomba.shop/og-default.jpg'
    const pageUrl  = `https://gikomba.shop/product/${id}`

    return {
      title,
      description: desc,
      openGraph: {
        title,
        description: desc,
        url: pageUrl,
        siteName: 'Gikomba Shop',
        images: [
          {
            url: imageUrl,
            width: 800,
            height: 800,
            alt: product.name,
          },
        ],
        locale: 'en_KE',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description: desc,
        images: [imageUrl],
      },
    }
  } catch {
    return {
      title: 'Product | Gikomba Shop',
      description: "Shop quality products on Kenya's trusted online marketplace.",
    }
  }
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
