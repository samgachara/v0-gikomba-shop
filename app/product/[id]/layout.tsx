import { createClient } from '@/lib/supabase/server'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const supabase = await createClient()
    const { data: product } = await supabase
      .from('products')
      .select('name, description, price, image_url, category')
      .eq('id', id)
      .single()

    if (!product) return { title: 'Product | Gikomba Shop' }

    return {
      title: `${product.name} | Gikomba Shop`,
      description: product.description ?? `Buy ${product.name} for KSh ${product.price.toLocaleString()} on Gikomba Shop. Fast delivery across Kenya.`,
      openGraph: {
        title: `${product.name} | Gikomba Shop`,
        description: `KSh ${Number(product.price).toLocaleString()} · ${product.category} · Fast delivery Kenya`,
        images: product.image_url ? [{ url: product.image_url, width: 800, height: 800 }] : [],
      },
    }
  } catch {
    return { title: 'Product | Gikomba Shop' }
  }
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return children
}
