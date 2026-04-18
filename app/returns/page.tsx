import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react'

export const metadata = { title: 'Returns & Refunds - gikomba.shop' }

export default function ReturnsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Returns & Refunds</h1>
            <p className="text-muted-foreground text-lg">Shop with confidence — we make returns simple</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: Clock, label: '7-Day Window', desc: 'Return any item within 7 days of delivery' },
              { icon: CheckCircle, label: 'Full Refund', desc: 'Get your money back via M-Pesa or original payment method' },
              { icon: RefreshCw, label: 'Free Collection', desc: 'We collect the item from you at no extra cost' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="text-center p-6 border border-border rounded-xl">
                <Icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="font-semibold mb-1">{label}</p>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
          <div className="space-y-6">
            <div className="p-6 border border-green-200 bg-green-50 rounded-xl">
              <div className="flex items-center gap-2 mb-3"><CheckCircle className="w-5 h-5 text-green-600" /><h3 className="font-semibold text-green-800">Eligible for Return</h3></div>
              <ul className="space-y-1 text-sm text-green-700">
                {['Item arrived damaged or defective','Wrong item delivered','Item not as described in listing','Item never arrived (full refund guaranteed)'].map(i => <li key={i} className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-green-600 rounded-full" />{i}</li>)}
              </ul>
            </div>
            <div className="p-6 border border-red-200 bg-red-50 rounded-xl">
              <div className="flex items-center gap-2 mb-3"><XCircle className="w-5 h-5 text-red-600" /><h3 className="font-semibold text-red-800">Not Eligible for Return</h3></div>
              <ul className="space-y-1 text-sm text-red-700">
                {['Change of mind after 7 days','Items without original packaging','Perishable goods (food, flowers)','Personalised or custom-made items','Underwear and swimwear (hygiene)'].map(i => <li key={i} className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-600 rounded-full" />{i}</li>)}
              </ul>
            </div>
          </div>
          <div className="mt-10 p-6 bg-muted rounded-xl">
            <h3 className="font-semibold mb-3">How to Return</h3>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li>Go to My Account → My Orders and select the order</li>
              <li>Click "Return Item" and describe the issue</li>
              <li>We'll confirm within 24 hours and arrange collection</li>
              <li>Refund processed within 3–5 business days</li>
            </ol>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
