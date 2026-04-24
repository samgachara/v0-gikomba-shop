import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

const posts: Record<string, { title: string; date: string; category: string; content: string }> = {
  'tips-for-selling-on-gikomba': {
    title: '5 Tips for Selling Successfully on gikomba.shop',
    date: 'March 15, 2026',
    category: 'Seller Tips',
    content: `
## 1. Write a Clear, Honest Product Title
Your title should include the product name, key feature, and condition. Example: "Men's Nike Air Max — Size 42 — Grade B" beats "Nice shoes for sale".

## 2. Use Real Photos
Buyers decide with their eyes first. Take photos in good natural light. Show any wear or defects — this builds trust and reduces returns.

## 3. Price Competitively
Check what similar items sell for on other Kenyan platforms. Slightly undercut if you're new — your first 5 reviews matter more than your first profit margin.

## 4. Set Your Quality Grade
gikomba.shop lets you grade products A, B, or C. Use it honestly. Buyers who know what to expect are satisfied buyers who leave good reviews.

## 5. Respond to Buyers Fast
Sellers who respond to WhatsApp enquiries within the hour close 3x more sales than those who respond same-day. Turn on notifications.
    `,
  },
  'mpesa-vs-card-payments': {
    title: 'M-Pesa vs Card Payments: Which is Better for Online Shopping?',
    date: 'March 8, 2026',
    category: 'Payment',
    content: `
## M-Pesa: The Kenyan Default

M-Pesa is the most popular payment method on gikomba.shop — and for good reason. It's instant, familiar, and doesn't require a bank account. The STK push means you just enter your PIN and the payment is done.

**Pros:** Instant, widely trusted, no card needed, works on any phone.  
**Cons:** Requires good network, transaction limits apply.

## Card Payments: For the Banked

Visa and Mastercard work well for larger purchases or for buyers who prefer keeping purchases off their M-Pesa statement.

**Pros:** Higher limits, works internationally, full purchase history.  
**Cons:** Requires a bank account, slightly more steps.

## Pay on Delivery: For First-Time Buyers

New to gikomba.shop? Pay on Delivery (Nairobi only) lets you inspect the item before paying. Best for higher-value purchases.

**Our recommendation:** Use M-Pesa for quick purchases under KSh 5,000. Use card for larger orders. Use Pay on Delivery for your very first order if you want peace of mind.
    `,
  },
  'gikomba-market-story': {
    title: 'How Gikomba Market Inspired Us to Build This Platform',
    date: 'February 20, 2026',
    category: 'Company',
    content: `
## The Market That Never Sleeps

Gikomba in Nairobi is not just a market — it's an institution. Every day, thousands of traders and buyers crowd its lanes, hunting for quality second-hand clothes, electronics, and household goods at honest prices.

We grew up going to Gikomba. We saw the energy, the hustle, and the value. We also saw the friction: no receipts, no returns, no way to know if the seller you bought from today would be there tomorrow.

## The Problem We Wanted to Solve

Kenya's informal trade is massive — but informal means unpredictable for buyers. You could find a grade-A leather jacket for KSh 300, or you could get home and find it falls apart in the wash.

We asked: what if Gikomba had trust infrastructure?

## Building gikomba.shop

In 2025, Samwel Gachara and Isaac Mwathi started building. The goal was simple: take the spirit of Gikomba — great value, local sellers, real products — and add the trust layer that the physical market lacks.

Verified sellers. Quality grades. M-Pesa payments. Buyer protection. Real reviews from real buyers.

That's gikomba.shop. We're still early. But we're building something real.
    `,
  },
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = posts[params.slug]
  if (!post) return { title: 'Post Not Found' }
  return {
    title: `${post.title} | gikomba.shop Blog`,
    description: post.content.slice(0, 150).replace(/[#*]/g, '').trim(),
  }
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = posts[params.slug]
  if (!post) notFound()

  // Simple markdown-like rendering
  const paragraphs = post.content.trim().split('\n\n')

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/blog" className="text-sm text-primary hover:underline mb-8 inline-block">
            ← Back to Blog
          </Link>
          <div className="mb-6">
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{post.category}</span>
            <span className="text-xs text-muted-foreground ml-3">{post.date}</span>
          </div>
          <h1 className="text-4xl font-bold mb-8 leading-tight">{post.title}</h1>
          <div className="prose prose-gray max-w-none space-y-4">
            {paragraphs.map((p, i) => {
              if (p.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold mt-8 mb-3">{p.replace('## ', '')}</h2>
              if (p.startsWith('**')) return <p key={i} className="text-sm text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              return <p key={i} className="text-muted-foreground leading-relaxed">{p}</p>
            })}
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center">
            <p className="text-muted-foreground mb-4">Ready to start shopping or selling?</p>
            <Link href="/shop" className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 mr-3">Shop Now</Link>
            <Link href="/auth/sign-up?role=seller" className="inline-flex items-center justify-center rounded-md border border-border px-6 py-2 text-sm font-medium hover:bg-muted">Become a Seller</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
