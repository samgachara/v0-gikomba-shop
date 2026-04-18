import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
export const metadata = { title: 'Press - gikomba.shop' }
export default function PressPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Press Room</h1>
            <p className="text-muted-foreground text-lg">News and media resources for gikomba.shop</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="p-8 bg-muted rounded-2xl">
              <h2 className="text-xl font-semibold mb-4">Company Facts</h2>
              <dl className="space-y-3 text-sm">
                {[['Founded','2025'],['Headquarters','Nairobi, Kenya'],['Focus','Kenyan e-commerce marketplace'],['Payment','M-Pesa, Airtel, Card']].map(([k,v]) => (
                  <div key={k} className="flex justify-between"><dt className="text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="p-8 bg-muted rounded-2xl">
              <h2 className="text-xl font-semibold mb-4">Media Contact</h2>
              <p className="text-muted-foreground text-sm mb-4">For press inquiries, interview requests, or media partnerships:</p>
              <p className="font-medium">press@gikomba.shop</p>
              <p className="text-sm text-muted-foreground mt-1">We respond to media enquiries within 24 hours.</p>
            </div>
          </div>
          <div className="text-center p-8 border border-border rounded-2xl">
            <h2 className="text-xl font-semibold mb-3">Brand Assets</h2>
            <p className="text-muted-foreground mb-4">Need our logo, brand guidelines or product screenshots? Email us and we&apos;ll send a full press kit.</p>
            <a href="mailto:press@gikomba.shop" className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Request Press Kit</a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
