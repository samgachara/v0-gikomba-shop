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
          <div className="p-8 border border-border rounded-2xl">
            <h2 className="text-xl font-semibold mb-3">Brand Assets</h2>
            <p className="text-muted-foreground mb-6">Use these assets when writing about gikomba.shop. Please do not alter the logo or brand colours.</p>
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Primary Colour', value: '#16a34a', type: 'color' },
                { label: 'Brand Font', value: 'Inter / System UI', type: 'text' },
                { label: 'Brand Name', value: 'gikomba.shop', type: 'text' },
              ].map(({ label, value, type }) => (
                <div key={label} className="p-4 bg-muted rounded-xl text-sm">
                  <p className="text-muted-foreground mb-1">{label}</p>
                  {type === 'color'
                    ? <div className="flex items-center gap-2"><div className="w-5 h-5 rounded" style={{ backgroundColor: value }} /><span className="font-mono font-medium">{value}</span></div>
                    : <p className="font-medium">{value}</p>}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mb-4">For logos, screenshots, and the full brand guidelines kit:</p>
            <a href="mailto:press@gikomba.shop?subject=Press Kit Request" className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Request Full Press Kit</a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
