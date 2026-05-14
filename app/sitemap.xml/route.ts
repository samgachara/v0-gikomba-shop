import { createClient } from '@/lib/supabase/server'
import { SITE_URL } from '@/lib/site'

export const dynamic = 'force-dynamic'

const BLOG_SLUGS = [
  'tips-for-selling-on-gikomba',
  'mpesa-vs-card-payments',
  'gikomba-market-story',
  'buyer-protection-guide',
  'product-grading-explained',
  'how-to-shop-safely-online-kenya',
]

export async function GET() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('id, updated_at')
    .eq('is_active', true)

  const { data: sellers } = await supabase
    .from('sellers')
    .select('id, created_at')
    .eq('status', 'active')

  const now = new Date().toISOString()

  const staticUrls = [
    { url: SITE_URL,                      priority: 1.0, changeFrequency: 'daily',   lastmod: now },
    { url: `${SITE_URL}/shop`,            priority: 0.9, changeFrequency: 'daily',   lastmod: now },
    { url: `${SITE_URL}/blog`,            priority: 0.8, changeFrequency: 'weekly',  lastmod: now },
    { url: `${SITE_URL}/about`,           priority: 0.8, changeFrequency: 'monthly', lastmod: now },
    { url: `${SITE_URL}/faq`,             priority: 0.8, changeFrequency: 'weekly',  lastmod: now },
    { url: `${SITE_URL}/contact`,         priority: 0.7, changeFrequency: 'monthly', lastmod: now },
    { url: `${SITE_URL}/shipping`,        priority: 0.7, changeFrequency: 'monthly', lastmod: now },
    { url: `${SITE_URL}/returns`,         priority: 0.7, changeFrequency: 'monthly', lastmod: now },
    { url: `${SITE_URL}/careers`,         priority: 0.6, changeFrequency: 'weekly',  lastmod: now },
    { url: `${SITE_URL}/press`,           priority: 0.6, changeFrequency: 'monthly', lastmod: now },
    { url: `${SITE_URL}/privacy`,         priority: 0.4, changeFrequency: 'monthly', lastmod: now },
    { url: `${SITE_URL}/terms`,           priority: 0.4, changeFrequency: 'monthly', lastmod: now },
    { url: `${SITE_URL}/cookies`,         priority: 0.3, changeFrequency: 'monthly', lastmod: now },
  ]

  const blogUrls = BLOG_SLUGS.map(slug => ({
    url: `${SITE_URL}/blog/${slug}`,
    priority: 0.8,
    changeFrequency: 'monthly',
    lastmod: now,
  }))

  const productUrls = (products || []).map(p => ({
    url: `${SITE_URL}/product/${p.id}`,
    priority: 0.7,
    changeFrequency: 'daily',
    lastmod: p.updated_at || now,
  }))

  const sellerUrls = (sellers || []).map(s => ({
    url: `${SITE_URL}/vendor/${s.id}`,
    priority: 0.6,
    changeFrequency: 'weekly',
    lastmod: s.created_at || now,
  }))

  const all = [...staticUrls, ...blogUrls, ...productUrls, ...sellerUrls]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all.map(u => `  <url>
    <loc>${u.url}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changeFrequency}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return new Response(sitemap, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
