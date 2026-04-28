import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SITE_NAME, SITE_URL } from '@/lib/site'

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
        title: 'Product',
        description: "Shop quality products on Kenya's trusted online marketplace.",
      }
    }

    const cleanDescription = product.description?.trim()
    const description =
      cleanDescription && cleanDescription.length >= 20
        ? cleanDescription
        : `Buy ${product.name} on Gikomba Shop. Quality ${product.category ?? 'products'} with M-Pesa payments and delivery across Kenya.`
    const title = `${product.name} - KSh ${product.price?.toLocaleString()}`
    const imageUrl = product.image_url ?? `${SITE_URL}/og-image.png`
    const canonicalUrl = `${SITE_URL}/product/${id}`

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: SITE_NAME,
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
        description,
        images: [imageUrl],
      },
    }
  } catch {
    return {
      title: 'Product',
      description: "Shop quality products on Kenya's trusted online marketplace.",
    }
  }
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
