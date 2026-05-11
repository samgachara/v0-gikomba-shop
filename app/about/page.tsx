import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ShoppingBag, Users, Shield, Truck, Star, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'About Us – gikomba.shop',
  description: 'gikomba.shop is Kenya\'s trusted online marketplace connecting buyers and sellers across all 47 counties. Built in Nairobi, inspired by Gikomba Market.',
}

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">

        {/* Hero */}
        <section className="bg-primary/5 py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">Kenya&apos;s Trusted Online Marketplace</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              gikomba.shop connects Kenyan buyers and sellers — bringing the spirit of Gikomba Market online with verified sellers, quality grades, and buyer protection on every order.
            </p>
          </div>
        </section>

        {/* Story + Stats */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
              <div>
                <h2 className="text-3xl font-bold mb-4">Our Story</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Gikomba Market in Nairobi is one of East Africa&apos;s most vibrant trading ecosystems. Every day, thousands of traders and buyers crowd its lanes hunting for quality goods at honest prices. We grew up going there. We saw the energy, the hustle, and the value.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We also saw the friction — no receipts, no returns, no way to know if the seller you bought from today would be there tomorrow. Buyers took risks on every transaction. Good sellers had no way to build a reputation.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  In 2025, we started building the solution: take the spirit of Gikomba — great value, local sellers, real products — and add the trust infrastructure the physical market has always lacked. Verified sellers. Quality grades. M-Pesa payments. Buyer protection. That&apos;s gikomba.shop.
                </p>
              </div>
              <div className="bg-muted rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-6 text-center">
                  {[
                    ['47', 'Counties Served'],
                    ['M-Pesa', 'Primary Payment'],
                    ['7 Days', 'Return Window'],
                    ['2025', 'Founded'],
                  ].map(([n, l]) => (
                    <div key={l}>
                      <p className="text-3xl font-bold text-primary">{n}</p>
                      <p className="text-sm text-muted-foreground mt-1">{l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Values */}
            <div className="grid md:grid-cols-3 gap-8 mb-20">
              {[
                { icon: Users, title: 'Community First', desc: 'We exist to serve Kenyan traders and shoppers. Every feature we build starts with the question: does this make life easier for a seller in Eldoret or a buyer in Mombasa?' },
                { icon: Shield, title: 'Trust by Design', desc: 'Buyer Protection on every order, verified sellers, quality grades, and secure M-Pesa payments. Trust isn\'t a feature — it\'s the foundation everything else is built on.' },
                { icon: Truck, title: 'Nationwide Reach', desc: 'We partner with reliable couriers to deliver to all 47 counties. Whether you\'re in Nairobi CBD or Mandera, your order gets to you.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="text-center p-6 rounded-xl border border-border">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            {/* How it works */}
            <div className="mb-20">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-3">How gikomba.shop Works</h2>
                <p className="text-muted-foreground">Simple for buyers. Powerful for sellers.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="p-8 bg-muted rounded-2xl">
                  <h3 className="text-xl font-bold mb-5 flex items-center gap-2"><ShoppingBag className="h-5 w-5 text-primary" />For Buyers</h3>
                  <ul className="space-y-3">
                    {[
                      'Browse verified sellers and quality-graded products',
                      'Pay securely via M-Pesa, card, or Pay on Delivery',
                      'Your money is held until you confirm receipt',
                      '7-day returns if the item isn\'t as described',
                      'Real reviews from real verified buyers',
                    ].map(t => (
                      <li key={t} className="flex gap-3 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />{t}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-8 bg-muted rounded-2xl">
                  <h3 className="text-xl font-bold mb-5 flex items-center gap-2"><Star className="h-5 w-5 text-primary" />For Sellers</h3>
                  <ul className="space-y-3">
                    {[
                      'Free to list — we only charge 5% on completed sales',
                      'Reach buyers across all 47 counties from day one',
                      'Get paid via M-Pesa within 2–3 business days',
                      'Build your reputation with verified buyer reviews',
                      'Manage your store, orders, and earnings from one dashboard',
                    ].map(t => (
                      <li key={t} className="flex gap-3 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />{t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quality grades */}
        <section className="py-16 px-4 border-t border-border">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3">Our Quality Grading System</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">Every product on gikomba.shop is graded by the seller so you always know exactly what you&apos;re buying before you pay.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { grade: 'A', label: 'Grade A — Like New', color: 'border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900', badge: 'text-green-700 dark:text-green-400', desc: 'Mint condition. No visible wear or defects. May be brand new or used once. Original packaging may or may not be included.' },
                { grade: 'B', label: 'Grade B — Good Condition', color: 'border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900', badge: 'text-blue-700 dark:text-blue-400', desc: 'Light use. Minor signs of wear that don\'t affect quality or function — small scuffs, light pilling, or surface marks.' },
                { grade: 'C', label: 'Grade C — Fair Condition', color: 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900', badge: 'text-yellow-700 dark:text-yellow-400', desc: 'Noticeable wear but fully functional. Priced low to reflect condition. Great value for budget-conscious shoppers.' },
              ].map(({ grade, label, color, badge, desc }) => (
                <div key={grade} className={`p-6 rounded-xl border-2 ${color}`}>
                  <div className={`text-3xl font-bold mb-2 ${badge}`}>Grade {grade}</div>
                  <p className="font-semibold mb-2">{label}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-6">Sellers who misgrade items lose their verified status. If your item doesn&apos;t match its grade, you&apos;re covered by our <Link href="/returns" className="text-primary hover:underline">Buyer Protection policy</Link>.</p>
          </div>
        </section>

        {/* Founders */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-3">Meet the Founders</h2>
            <p className="text-muted-foreground mb-12">The people behind gikomba.shop</p>
            <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              {[
                {
                  name: 'Samwel Gachara',
                  role: 'Co-Founder & CEO',
                  initial: 'S',
                  bio: 'Nairobi-based entrepreneur passionate about building trust infrastructure for African commerce. Previously in retail and digital marketing.',
                  linkedin: 'https://linkedin.com/in/samwel-gachara',
                },
                {
                  name: 'Isaac Mwathi',
                  role: 'Co-Founder & CTO',
                  initial: 'I',
                  bio: 'Software engineer with a focus on building reliable, scalable systems for emerging market e-commerce. Based in Nairobi.',
                  linkedin: 'https://linkedin.com/in/isaac-mwathi',
                },
              ].map(({ name, role, initial, bio, linkedin }) => (
                <div key={name} className="flex flex-col items-center p-8 rounded-2xl bg-card border border-border">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <span className="text-3xl font-bold text-primary">{initial}</span>
                  </div>
                  <h3 className="text-xl font-semibold">{name}</h3>
                  <p className="text-muted-foreground text-sm mt-1 mb-3">{role}</p>
                  <p className="text-sm text-muted-foreground text-center leading-relaxed mb-4">{bio}</p>
                  <a href={linkedin} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium">
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                    LinkedIn Profile
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 border-t border-border">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-3">Ready to get started?</h2>
            <p className="text-muted-foreground mb-8">Join thousands of Kenyans buying and selling on gikomba.shop</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/shop" className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">Shop Now</Link>
              <Link href="/auth/sign-up?role=seller" className="inline-flex items-center justify-center rounded-md border border-border px-8 py-3 text-sm font-medium hover:bg-muted">Become a Seller</Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
