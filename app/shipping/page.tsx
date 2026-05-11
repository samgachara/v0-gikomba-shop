import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Truck, Clock, MapPin, Package, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Shipping & Delivery – gikomba.shop', description: 'Delivery across all 47 counties in Kenya. Same-day in Nairobi, 2–6 days countrywide.' }

export default function ShippingPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-3">Shipping & Delivery</h1>
          <p className="text-muted-foreground text-lg mb-12">We deliver to all 47 counties in Kenya. Here's everything you need to know.</p>

          {/* Delivery Options */}
          <div className="grid sm:grid-cols-3 gap-4 mb-12">
            {[
              { icon: Clock, title: 'Same-Day', desc: 'Nairobi only, orders before 10am', price: 'KSh 350' },
              { icon: Truck, title: 'Standard', desc: '1–6 business days by location', price: 'From KSh 150' },
              { icon: Package, title: 'Free Delivery', desc: 'Orders above KSh 5,000', price: 'KSh 0' },
            ].map(({ icon: Icon, title, desc, price }) => (
              <div key={title} className="p-6 bg-muted rounded-2xl">
                <Icon className="h-6 w-6 text-primary mb-3" />
                <h3 className="font-semibold mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{desc}</p>
                <p className="text-sm font-bold text-primary">{price}</p>
              </div>
            ))}
          </div>

          {/* Delivery Timeframes */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Delivery Timeframes by Region</h2>
            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Region</th>
                    <th className="text-left px-4 py-3 font-semibold">Towns</th>
                    <th className="text-left px-4 py-3 font-semibold">Timeframe</th>
                    <th className="text-left px-4 py-3 font-semibold">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { region: 'Nairobi (Express)', towns: 'All Nairobi areas', time: 'Same day (order by 10am)', cost: 'KSh 350' },
                    { region: 'Nairobi (Standard)', towns: 'All Nairobi areas', time: '1 business day', cost: 'KSh 150' },
                    { region: 'Central Kenya', towns: 'Thika, Nyeri, Muranga, Kiambu', time: '1–2 business days', cost: 'KSh 200' },
                    { region: 'Coast', towns: 'Mombasa, Malindi, Kilifi, Kwale', time: '2–3 business days', cost: 'KSh 300' },
                    { region: 'Rift Valley', towns: 'Nakuru, Eldoret, Kericho, Naivasha', time: '2–3 business days', cost: 'KSh 280' },
                    { region: 'Nyanza & Western', towns: 'Kisumu, Kakamega, Kisii, Siaya', time: '3–4 business days', cost: 'KSh 300' },
                    { region: 'Eastern', towns: 'Machakos, Kitui, Meru, Embu', time: '2–4 business days', cost: 'KSh 280' },
                    { region: 'North Eastern & Remote', towns: 'Garissa, Isiolo, Mandera, Wajir', time: '4–6 business days', cost: 'KSh 400' },
                  ].map(({ region, towns, time, cost }) => (
                    <tr key={region} className="hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{region}</td>
                      <td className="px-4 py-3 text-muted-foreground">{towns}</td>
                      <td className="px-4 py-3">{time}</td>
                      <td className="px-4 py-3 font-semibold text-primary">{cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-3">* Timeframes are estimates. Public holidays and extreme weather may cause delays.</p>
          </div>

          {/* How It Works */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">How Delivery Works</h2>
            <div className="space-y-4">
              {[
                { step: '1', title: 'Place your order', desc: 'Complete checkout with your accurate delivery address and phone number.' },
                { step: '2', title: 'Seller confirms', desc: 'The seller has 48 hours to confirm and pack your order.' },
                { step: '3', title: 'Dispatched', desc: 'You receive an SMS with a tracking link once the courier picks up your package.' },
                { step: '4', title: 'Out for delivery', desc: 'The courier will call you before arriving. Make sure your phone is reachable.' },
                { step: '5', title: 'Delivered', desc: 'Inspect the package before the courier leaves. If anything is wrong, refuse delivery and contact us immediately.' },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">{step}</div>
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Important Notes */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Important Notes</h2>
            <div className="space-y-3">
              {[
                { icon: CheckCircle, color: 'text-green-600', text: 'Always provide a precise delivery address including estate, road, and nearest landmark.' },
                { icon: CheckCircle, color: 'text-green-600', text: 'Ensure your phone is reachable on delivery day — couriers call ahead.' },
                { icon: CheckCircle, color: 'text-green-600', text: 'Inspect your item before signing for it. Report damage immediately.' },
                { icon: AlertCircle, color: 'text-orange-500', text: 'Delivery to PO Boxes is not available. A physical address is required.' },
                { icon: AlertCircle, color: 'text-orange-500', text: 'If you miss delivery, the courier will attempt re-delivery once. After that, you collect from their depot.' },
                { icon: AlertCircle, color: 'text-orange-500', text: 'Deliveries are made Monday–Saturday, 8am–6pm. No Sunday deliveries.' },
              ].map(({ icon: Icon, color, text }) => (
                <div key={text} className="flex gap-3">
                  <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${color}`} />
                  <p className="text-sm text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-muted rounded-2xl text-center">
            <p className="text-muted-foreground mb-4">Delivery issue or question?</p>
            <Link href="/contact" className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Contact Support</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
