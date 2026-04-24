import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Truck, Clock, MapPin, Package } from 'lucide-react'

export const metadata = { title: 'Shipping & Delivery – gikomba.shop', description: 'Fast delivery across all 47 counties in Kenya. Standard 2–5 days KSh 200, Express same-day in Nairobi. Free shipping on orders over KSh 5,000.' }

export default function ShippingPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Shipping Information</h1>
            <p className="text-muted-foreground text-lg">Fast, reliable delivery across all 47 counties</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {[
              { icon: Truck, title: 'Standard Delivery', lines: ['2–5 business days', 'KSh 200 flat rate', 'FREE on orders over KSh 5,000'] },
              { icon: Clock, title: 'Express Delivery', lines: ['Same-day (Nairobi only)', 'Next-day (major towns)', 'KSh 400 flat rate'] },
              { icon: MapPin, title: 'Coverage', lines: ['All 47 counties', 'Major towns & rural areas', 'Island delivery available'] },
              { icon: Package, title: 'Packaging', lines: ['Secure bubble wrap', 'Eco-friendly materials', 'Discreet packaging on request'] },
            ].map(({ icon: Icon, title, lines }) => (
              <div key={title} className="border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{title}</h3>
                </div>
                <ul className="space-y-2">
                  {lines.map(l => <li key={l} className="text-sm text-muted-foreground flex items-center gap-2"><span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />{l}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="bg-muted rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4">Delivery Timeframes by Region</h2>
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border"><th className="text-left py-2 font-semibold">Region</th><th className="text-left py-2 font-semibold">Standard</th><th className="text-left py-2 font-semibold">Express</th></tr></thead>
              <tbody className="divide-y divide-border">
                {[['Nairobi','1–2 days','Same day'],['Coast (Mombasa, Malindi)','2–3 days','Next day'],['Central (Kiambu, Nyeri)','2–3 days','Next day'],['Rift Valley (Nakuru, Eldoret)','3–4 days','Next day'],['Western & Nyanza','3–5 days','2 days'],['Northern Kenya','4–7 days','3 days']].map(([r,s,e]) => (
                  <tr key={r}><td className="py-2 text-muted-foreground">{r}</td><td className="py-2">{s}</td><td className="py-2">{e}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
