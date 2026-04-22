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

        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-3">Meet the Founders</h2>
            <p className="text-muted-foreground mb-12">The people behind gikomba.shop</p>
            <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              {[
                { name: 'Samwel Gachara', role: 'Co-Founder & CEO', initial: 'S' },
                { name: 'Isaac Mwathi',   role: 'Co-Founder & CTO', initial: 'I' },
              ].map(({ name, role, initial }) => (
                <div key={name} className="flex flex-col items-center p-8 rounded-2xl bg-card border border-border">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <span className="text-3xl font-bold text-primary">{initial}</span>
                  </div>
                  <h3 className="text-xl font-semibold">{name}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{role}</p>
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
