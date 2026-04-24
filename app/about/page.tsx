import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ShoppingBag, Users, Shield, Truck } from 'lucide-react'

export const metadata = { title: 'About Us - gikomba.shop' }

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <section className="bg-primary/5 py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">Kenya&apos;s Favourite Online Marketplace</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              gikomba.shop connects Kenyan buyers and sellers, bringing the spirit of Gikomba Market online — quality products at honest prices.
            </p>
          </div>
        </section>
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
              <div>
                <h2 className="text-3xl font-bold mb-4">Our Story</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Born from the vibrant hustle of Gikomba Market in Nairobi, we built gikomba.shop to give every Kenyan trader and shopper access to a modern, trustworthy online marketplace.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Whether you&apos;re a small vendor in Eldoret, a fashion reseller in Mombasa, or a buyer looking for affordable quality — gikomba.shop is your platform.
                </p>
              </div>
              <div className="bg-muted rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-6 text-center">
                  {[['47','Counties Served'],['M-Pesa','Secure Payments'],['24–48h','Delivery Time'],['2025','Founded']].map(([n,l]) => (
                    <div key={l}>
                      <p className="text-3xl font-bold text-primary">{n}</p>
                      <p className="text-sm text-muted-foreground mt-1">{l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Users, title: 'Community First', desc: 'We support local Kenyan businesses and empower entrepreneurs to reach customers across the country.' },
                { icon: Shield, title: 'Safe & Trusted', desc: 'Secure M-Pesa payments and buyer protection on every order give you complete peace of mind.' },
                { icon: Truck, title: 'Fast Delivery', desc: 'We partner with reliable courier services to deliver your orders across all 47 counties.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="text-center p-6 rounded-xl border border-border">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 border-t border-border">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3">Our Product Quality System</h2>
              <p className="text-muted-foreground">Every product on gikomba.shop is graded by the seller so you always know what you&apos;re buying</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { grade: 'A', label: 'Grade A — Like New', color: 'border-green-200 bg-green-50', badge: 'text-green-700', desc: 'Mint condition. No visible wear. May be brand new or barely used.' },
                { grade: 'B', label: 'Grade B — Good Condition', color: 'border-blue-200 bg-blue-50', badge: 'text-blue-700', desc: 'Light use. Minor wear that does not affect quality or function.' },
                { grade: 'C', label: 'Grade C — Fair Condition', color: 'border-yellow-200 bg-yellow-50', badge: 'text-yellow-700', desc: 'Visible signs of use. Fully functional. Great value for budget buyers.' },
              ].map(({ grade, label, color, badge, desc }) => (
                <div key={grade} className={`p-6 rounded-xl border-2 ${color}`}>
                  <div className={`text-3xl font-bold mb-2 ${badge}`}>Grade {grade}</div>
                  <p className="font-semibold mb-2">{label}</p>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

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
                  bio: 'Nairobi-based entrepreneur passionate about democratising e-commerce for Kenyan traders and buyers.',
                  linkedin: 'https://linkedin.com/in/samwel-gachara',
                },
                {
                  name: 'Isaac Mwathi',
                  role: 'Co-Founder & CTO',
                  initial: 'I',
                  bio: 'Software engineer building reliable, scalable technology for the next generation of African commerce.',
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
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    LinkedIn Profile
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
