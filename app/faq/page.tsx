import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export const metadata = { title: 'FAQs - gikomba.shop' }

const faqs = [
  { q: 'How do I place an order?', a: 'Browse our shop, add items to your cart, and proceed to checkout. You can pay via M-Pesa or card.' },
  { q: 'What payment methods do you accept?', a: 'We accept M-Pesa, Airtel Money, Visa, and Mastercard. M-Pesa is the most popular option among Kenyan customers.' },
  { q: 'How long does delivery take?', a: 'Nairobi orders are delivered within 1–2 business days. Other counties take 2–5 business days.' },
  { q: 'Can I return a product?', a: 'Yes! You have 7 days after delivery to return any item in its original condition. See our Returns Policy for details.' },
  { q: 'How do I become a seller?', a: 'Sign up and select "Sell" as your account type. You\'ll get instant access to your seller dashboard where you can list products.' },
  { q: 'Is my payment information secure?', a: 'Absolutely. We use industry-standard encryption and never store your card details. M-Pesa payments go through Safaricom\'s secure platform.' },
  { q: 'How do I track my order?', a: 'Once your order ships, you\'ll receive an SMS and email with tracking details. You can also check your order status in your account.' },
  { q: 'What if I receive a wrong or damaged item?', a: 'Contact us within 48 hours of delivery. We\'ll arrange a replacement or full refund at no cost to you.' },
]

export default function FAQPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-muted-foreground">Everything you need to know about shopping on gikomba.shop</p>
          </div>
          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <div key={q} className="border border-border rounded-xl p-6">
                <h3 className="font-semibold mb-2">{q}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center p-8 bg-primary/5 rounded-2xl">
            <h3 className="font-semibold text-lg mb-2">Still have questions?</h3>
            <p className="text-muted-foreground mb-4">Our support team is ready to help</p>
            <a href="/contact" className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Contact Support
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
