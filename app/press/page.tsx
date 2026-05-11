import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export const metadata = { title: 'Press – gikomba.shop', description: 'Press resources, company facts, and media contacts for gikomba.shop.' }

export default function PressPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Press Room</h1>
            <p className="text-muted-foreground text-lg">News, resources, and media contacts for gikomba.shop</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="p-8 bg-muted rounded-2xl">
              <h2 className="text-xl font-semibold mb-4">Company Facts</h2>
              <dl className="space-y-3 text-sm">
                {[
                  ['Founded', '2025'],
                  ['Launched', 'May 2026'],
                  ['Headquarters', 'Nairobi, Kenya'],
                  ['Category', 'Online marketplace — fashion & lifestyle'],
                  ['Target market', 'Kenya (all 47 counties)'],
                  ['Payments', 'M-Pesa, Visa, Mastercard, Pay on Delivery'],
                  ['Mission', 'Bring the spirit of Gikomba Market online with trust'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-medium text-right">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="p-8 bg-muted rounded-2xl">
              <h2 className="text-xl font-semibold mb-4">Media Contact</h2>
              <p className="text-muted-foreground text-sm mb-6">For press enquiries, interview requests, partnerships, or media resources:</p>
              <div className="space-y-3 text-sm">
                <div><p className="text-muted-foreground">Email</p><p className="font-medium">press@gikomba.shop</p></div>
                <div><p className="text-muted-foreground">WhatsApp</p><p className="font-medium">+254 736 906 440</p></div>
                <div><p className="text-muted-foreground">Response time</p><p className="font-medium">Within 24 hours on business days</p></div>
              </div>
            </div>
          </div>

          {/* Brand assets */}
          <div className="p-8 border border-border rounded-2xl mb-8">
            <h2 className="text-xl font-semibold mb-2">Brand Assets</h2>
            <p className="text-muted-foreground text-sm mb-6">Use these assets when writing about gikomba.shop. Do not alter the logo, brand name spelling, or colours.</p>
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Brand Name', value: 'gikomba.shop', note: 'Always lowercase' },
                { label: 'Primary Colour', value: '#16a34a', note: 'Gikomba Green' },
                { label: 'Founded', value: 'Nairobi, 2025', note: 'Kenya-first marketplace' },
              ].map(({ label, value, note }) => (
                <div key={label} className="p-4 bg-muted rounded-xl text-sm">
                  <p className="text-muted-foreground mb-1">{label}</p>
                  <p className="font-semibold">{value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{note}</p>
                </div>
              ))}
            </div>
            <a href="mailto:press@gikomba.shop?subject=Press Kit Request" className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Request Full Press Kit</a>
          </div>

          {/* Story */}
          <div className="p-8 border border-border rounded-2xl">
            <h2 className="text-xl font-semibold mb-4">The Story</h2>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>gikomba.shop was born from a simple observation: Gikomba Market in Nairobi is one of the most vibrant trading ecosystems in East Africa, but it has no trust infrastructure. Buyers can find incredible value, but with no receipts, no returns, and no way to verify sellers, every transaction is a gamble.</p>
              <p>We set out to fix that. gikomba.shop takes the spirit of the market — affordable prices, local sellers, real products — and adds the trust layer it's always needed. Verified sellers, quality grades, M-Pesa payments, buyer protection, and real reviews from real buyers.</p>
              <p>We launched in May 2026, initially focused on fashion and lifestyle. Our goal is to become Kenya's most trusted marketplace for second-hand and affordable goods — built for Kenyans, by Kenyans.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
