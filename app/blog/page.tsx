import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
export const metadata = { title: 'Blog - gikomba.shop' }
const posts = [
  { title: '5 Tips for Selling Successfully on gikomba.shop', date: 'March 15, 2026', category: 'Seller Tips', excerpt: 'Learn how to write compelling product listings, price competitively, and get your first 10 sales.' },
  { title: 'M-Pesa vs Card Payments: Which is Better for Online Shopping?', date: 'March 8, 2026', category: 'Payment', excerpt: 'We break down the pros and cons of each payment method to help you choose what works best for you.' },
  { title: 'How Gikomba Market Inspired Us to Build This Platform', date: 'February 20, 2026', category: 'Company', excerpt: 'The story of how Kenya\'s most famous market became the inspiration for Kenya\'s newest e-commerce platform.' },
]
export default function BlogPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Blog</h1>
            <p className="text-muted-foreground">Tips, stories and updates from the gikomba.shop team</p>
          </div>
          <div className="space-y-8">
            {posts.map(p => (
              <article key={p.title} className="border border-border rounded-xl p-8 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{p.category}</span>
                  <span className="text-xs text-muted-foreground">{p.date}</span>
                </div>
                <h2 className="text-xl font-bold mb-3">{p.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{p.excerpt}</p>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
