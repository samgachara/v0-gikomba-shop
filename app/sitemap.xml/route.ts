import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const URL = 'https://www.gikomba.shop'

export async function GET() {
  const supabase = await createClient()

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, updated_at')
    .eq('is_active', true)

  if (productsError) {
    console.error('Failed to fetch products for sitemap:', productsError)
    return new Response('Error generating sitemap', { status: 500 })
  }

  const productUrls = (products || []).map(product => ({
    url: `${URL}/product/${product.id}`,
    lastModified: product.updated_at || new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  const staticUrls = [
    { url: URL, lastModified: new Date().toISOString(), changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${URL}/shop`, lastModified: new Date().toISOString(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${URL}/cart`, lastModified: new Date().toISOString(), changeFrequency: 'weekly' as const, priority: 0.5 },
    { url: `${URL}/wishlist`, lastModified: new Date().toISOString(), changeFrequency: 'weekly' as const, priority: 0.5 },
    { url: `${URL}/auth/login`, lastModified: new Date().toISOString(), changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${URL}/auth/sign-up`, lastModified: new Date().toISOString(), changeFrequency: 'monthly' as const, priority: 0.3 },
  ]

  const allUrls = [...staticUrls, ...productUrls]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allUrls.map(url => `
    <url>
      <loc>${url.url}</loc>
      <lastmod>${url.lastModified}</lastmod>
      <changefreq>${url.changeFrequency}</changefreq>
      <priority>${url.priority}</priority>
    </url>
  `).join('')}
</urlset>`

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
