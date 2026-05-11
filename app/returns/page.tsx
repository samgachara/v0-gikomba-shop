import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { RefreshCw, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Returns & Refunds – gikomba.shop', description: '7-day returns on all gikomba.shop orders. Full refund via M-Pesa if your item does not match the description.' }

export default function ReturnsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-3">Returns & Refunds</h1>
          <p className="text-muted-foreground text-lg mb-12">Your satisfaction is guaranteed. If something is wrong, we make it right.</p>

          {/* Key stats */}
          <div className="grid sm:grid-cols-3 gap-4 mb-12">
            {[
              { icon: Clock, title: '7 Days', desc: 'Return window from delivery date' },
              { icon: RefreshCw, title: '3–5 Days', desc: 'Refund processing time' },
              { icon: CheckCircle, title: '100%', desc: 'Refund if item misrepresented' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 bg-muted rounded-2xl text-center">
                <Icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold mb-1">{title}</p>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>

          {/* What you can return */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">What Can Be Returned</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-6 border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-800 dark:text-green-400">Eligible for Return</h3>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {['Item significantly different from listing photos or description', 'Wrong item delivered', 'Item arrived damaged or broken', 'Item has defects not mentioned in the listing', 'Item is counterfeit', 'Order not delivered within 14 days'].map(t => (
                    <li key={t} className="flex gap-2"><CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />{t}</li>
                  ))}
                </ul>
              </div>
              <div className="p-6 border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <h3 className="font-semibold text-red-700 dark:text-red-400">Not Eligible for Return</h3>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {['Change of mind (unless seller agrees)', 'Item matches description but you don\'t like it', 'Underwear, swimwear, or pierced jewellery (hygiene)', 'Items marked "Final Sale" at time of purchase', 'Items damaged after delivery', 'Return requested after 7 days'].map(t => (
                    <li key={t} className="flex gap-2"><XCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* How to return */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">How to Request a Return</h2>
            <div className="space-y-4">
              {[
                { step: '1', title: 'Go to My Account → Orders', desc: 'Find the order you want to return and click "Request Return".' },
                { step: '2', title: 'Describe the issue', desc: 'Write a clear description of the problem and attach at least 2 photos showing the issue.' },
                { step: '3', title: 'Wait for review', desc: 'Our team reviews your request within 24 hours on business days. We may contact you for more information.' },
                { step: '4', title: 'Ship the item back', desc: 'If approved, we\'ll send you a return label or pickup instructions. Package the item securely in its original packaging if possible.' },
                { step: '5', title: 'Receive your refund', desc: 'Once the seller confirms receipt of the return, your refund is processed within 3–5 business days to your original payment method.' },
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

          {/* Refund methods */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Refund Methods & Timelines</h2>
            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Payment Method</th>
                    <th className="text-left px-4 py-3 font-semibold">Refund To</th>
                    <th className="text-left px-4 py-3 font-semibold">Timeline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { method: 'M-Pesa', to: 'Same M-Pesa number used to pay', time: '1–2 business days' },
                    { method: 'Visa / Mastercard', to: 'Same card', time: '3–5 business days' },
                    { method: 'Pay on Delivery', to: 'M-Pesa (you provide number)', time: '2–3 business days' },
                  ].map(({ method, to, time }) => (
                    <tr key={method} className="hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{method}</td>
                      <td className="px-4 py-3 text-muted-foreground">{to}</td>
                      <td className="px-4 py-3">{time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Disputes */}
          <div className="mb-12 p-6 bg-muted rounded-2xl">
            <div className="flex gap-3 mb-3">
              <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <h2 className="text-xl font-bold">Buyer Protection Guarantee</h2>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">If a seller disputes your legitimate return, gikomba.shop steps in to make a final decision based on your photos, the original listing, and our seller records. If we rule in your favour, you receive a full refund regardless of the seller's position — funded by gikomba.shop if necessary. Your money is never at risk when you shop with us.</p>
          </div>

          <div className="text-center">
            <p className="text-muted-foreground mb-4">Have a return or refund question?</p>
            <Link href="/contact" className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Contact Support</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
