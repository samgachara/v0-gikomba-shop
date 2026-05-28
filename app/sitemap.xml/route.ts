import { SITE_URL } from '@/lib/site'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = 'https://ecrttmokkmaqdlsxhlvv.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjcnR0bW9ra21hcWRsc3hobHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMTU2MzAsImV4cCI6MjA4ODc5MTYzMH0.cb8SIczUHH3a6hytKZsFCuQF1qEKT7CIbuoUScrgAE0'

const BLOG_SLUGS = [
  'tips-for-selling-on-gikomba',
  'mpesa-vs-card-payments',
  'gikomba-market-story',
  'buyer-protection-guide',
  'product-grading-explained',
  'how-to-shop-safely-online-kenya',
]

async function supabaseGet(path: string) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` },
      next: { revalidate: 3600 },
    })
    return res.ok ? res.json() : []
  } catch { return [] }
}

export async function GET() {
  const now = new Date().toISOString()

  const [products, sellers] = await Promise.all([
    supabaseGet('products?select=id,updated_at&is_active=eq.true'),
    supabaseGet('sellers?select=id,created_at&status=eq.active'),
  ])

  const staticUrls = [
    { url: SITE_URL,                      priority: 1.0, changeFreq: 'daily',   lastmod: now },
    { url: `${SITE_URL}/shop`,            priority: 0.9, changeFreq: 'daily',   lastmod: now },
    { url: `${SITE_URL}/blog`,            priority: 0.8, changeFreq: 'weekly',  lastmod: now },
    { url: `${SITE_URL}/about`,           priority: 0.8, changeFreq: 'monthly', lastmod: now },
    { url: `${SITE_URL}/faq`,             priority: 0.8, changeFreq: 'weekly',  lastmod: now },
    { url: `${SITE_URL}/contact`,         priority: 0.7, changeFreq: 'monthly', lastmod: now },
    { url: `${SITE_URL}/shipping`,        priority: 0.7, changeFreq: 'monthly', lastmod: now },
    { url: `${SITE_URL}/returns`,         priority: 0.7, changeFreq: 'monthly', lastmod: now },
    { url: `${SITE_URL}/careers`,         priority: 0.6, changeFreq: 'weekly',  lastmod: now },
    { url: `${SITE_URL}/press`,           priority: 0.6, changeFreq: 'monthly', lastmod: now },
    { url: `${SITE_URL}/privacy`,         priority: 0.4, changeFreq: 'monthly', lastmod: now },
    { url: `${SITE_URL}/terms`,           priority: 0.4, changeFreq: 'monthly', lastmod: now },
    { url: `${SITE_URL}/cookies`,         priority: 0.3, changeFreq: 'monthly', lastmod: now },
  ]

  const blogUrls = BLOG_SLUGS.map(slug => ({
    url: `${SITE_URL}/blog/${slug}`, priority: 0.8, changeFreq: 'monthly', lastmod: now,
  }))

  const productUrls = (products || []).map((p: any) => ({
    url: `${SITE_URL}/product/${p.id}`, priority: 0.7, changeFreq: 'daily', lastmod: p.updated_at || now,
  }))

  const sellerUrls = (sellers || []).map((s: any) => ({
    url: `${SITE_URL}/vendor/${s.id}`, priority: 0.6, changeFreq: 'weekly', lastmod: s.created_at || now,
  }))

  const all = [...staticUrls, ...blogUrls, ...productUrls, ...sellerUrls]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all.map(u => `  <url>
    <loc>${u.url}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changeFreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return new Response(sitemap, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
