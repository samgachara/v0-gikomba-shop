import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const posts: Record<string, {
  title: string; date: string; category: string; content: string
}> = {
  'tips-for-selling-on-gikomba': {
    title: '5 Tips for Selling Successfully on gikomba.shop',
    date: 'March 15, 2026',
    category: 'Seller Tips',
    content: `Starting your selling journey on gikomba.shop is exciting — here's how to hit the ground running.

**1. Write clear, honest product titles**
Use the product name, key feature and condition. e.g. "Men's Leather Belt – Black – New" is better than just "Belt".

**2. Take quality photos**
Good lighting matters more than camera quality. Natural light near a window works perfectly. Show the product from multiple angles.

**3. Price competitively**
Browse similar products on the platform before pricing. A competitive price with a good photo will always outsell an expensive listing with a poor photo.

**4. Respond to inquiries quickly**
Buyers who get a fast response are much more likely to complete a purchase. Enable WhatsApp notifications so you never miss a message.

**5. Be accurate about stock**
Keep your inventory updated. Running out of stock damages your seller rating and disappoints buyers. Update listings as soon as items sell.`,
  },
  'mpesa-vs-card-payments': {
    title: 'M-Pesa vs Card Payments: Which is Better for Online Shopping?',
    date: 'March 8, 2026',
    category: 'Payment',
    content: `Both M-Pesa and card payments are accepted on gikomba.shop, but they work differently. Here's what to know.

**M-Pesa**
M-Pesa is the most popular payment method on gikomba.shop — and for good reason. It's instant, secure, and doesn't require a bank account. You simply enter your M-Pesa number at checkout and confirm the payment prompt on your phone. No card details to worry about, no risk of fraud.

Best for: Most Kenyan buyers. Fastest checkout experience.

**Card Payments (Visa/Mastercard)**
Card payments work through our secure payment gateway. They're ideal if you're shopping from outside Kenya or prefer to keep your M-Pesa balance for other uses. International buyers will find card payments the most familiar option.

Best for: International buyers or those without M-Pesa.

**Our recommendation**
For Kenyan buyers, M-Pesa is the fastest and most convenient option. For international purchases, use a card.`,
  },
  'gikomba-market-story': {
    title: 'How Gikomba Market Inspired Us to Build This Platform',
    date: 'February 20, 2026',
    category: 'Company',
    content: `Gikomba Market in Nairobi is one of the most vibrant commercial spaces in East Africa. Every day, thousands of vendors and buyers meet there to trade everything from second-hand clothes to electronics, household goods, and food.

What has always made Gikomba special is its energy — the hustle, the deals, the community. Buyers and sellers know each other. Trust is built face to face. Prices are negotiated. It's commerce in its most human form.

We built gikomba.shop to bring that same energy online. Not to replace the physical market, but to extend it. To let a seller in Gikomba reach a buyer in Mombasa, Kisumu or Eldoret without either of them leaving home.

Our goal is simple: make it as easy to buy and sell online in Kenya as it is at Gikomba market — with the security of digital payments and the speed of doorstep delivery.

We're just getting started. Join us.`,
  },
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = posts[slug]
  if (!post) return { title: 'Blog | Gikomba Shop' }
  return { title: `${post.title} | Gikomba Shop` }
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = posts[slug]
  if (!post) notFound()

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <Link href="/blog" className="text-sm text-primary hover:underline mb-8 inline-block">← Back to Blog</Link>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{post.category}</span>
            <span className="text-xs text-muted-foreground">{post.date}</span>
          </div>
          <h1 className="text-3xl font-bold mb-8">{post.title}</h1>
          <div className="prose prose-neutral max-w-none">
            {post.content.split('\n\n').map((para, i) => (
              <p key={i} className="mb-4 text-muted-foreground leading-relaxed whitespace-pre-line">{para}</p>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
