import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import Link from 'next/link'

export const metadata = { title: 'FAQs – gikomba.shop', description: 'Answers to common questions about ordering, payments, delivery, returns, and selling on gikomba.shop.' }

const faqs = [
  {
    category: 'Ordering & Payments',
    items: [
      { q: 'How do I place an order?', a: 'Browse the shop, add items to your cart, and proceed to checkout. You\'ll enter your delivery address and choose a payment method — M-Pesa, card, or Pay on Delivery (Nairobi only). You\'ll receive an order confirmation via email once payment is confirmed.' },
      { q: 'What payment methods do you accept?', a: 'We accept M-Pesa (STK push — just enter your PIN), Visa and Mastercard, and Pay on Delivery for Nairobi orders. All transactions are secured with SSL encryption.' },
      { q: 'Is it safe to pay on gikomba.shop?', a: 'Yes. We never store your card details. M-Pesa payments go through the official Safaricom STK push flow. Your money is held by gikomba.shop and only released to the seller after you confirm you\'ve received your item.' },
      { q: 'Can I pay on delivery?', a: 'Pay on Delivery is available for orders within Nairobi only. You pay cash to the courier upon receiving your item. Note: you can\'t use Pay on Delivery for orders from sellers outside Nairobi.' },
      { q: 'I paid but didn\'t get a confirmation. What do I do?', a: 'Check your spam folder first. If there\'s no email after 30 minutes, go to My Account → Orders to check your order status. If payment was deducted but no order appears, contact us at support@gikomba.shop with your M-Pesa transaction code.' },
    ],
  },
  {
    category: 'Delivery & Shipping',
    items: [
      { q: 'How long does delivery take?', a: 'Nairobi: 1–2 business days. Major towns (Mombasa, Kisumu, Nakuru, Eldoret): 2–4 business days. Other counties: 3–6 business days. Express same-day delivery is available in Nairobi for orders placed before 10am.' },
      { q: 'How much does shipping cost?', a: 'Standard delivery within Nairobi: KSh 150. Countrywide: KSh 250–350 depending on location. Orders above KSh 5,000 qualify for free standard delivery. Express delivery (Nairobi): KSh 350.' },
      { q: 'Can I track my order?', a: 'Yes. Once your order is dispatched, you\'ll receive an SMS with a tracking link. You can also track from My Account → Orders → Track Shipment.' },
      { q: 'What if my order is delayed?', a: 'If your order hasn\'t arrived within the estimated timeframe, contact us at support@gikomba.shop or WhatsApp +254 736 906 440. We\'ll investigate with the courier and update you within 24 hours.' },
      { q: 'Do you deliver outside Kenya?', a: 'Not yet. We currently deliver to all 47 counties within Kenya only. International shipping is on our roadmap.' },
    ],
  },
  {
    category: 'Returns & Refunds',
    items: [
      { q: 'What is your return policy?', a: 'You have 7 days from delivery to request a return if the item is significantly different from the description, damaged, or you received the wrong item. Items must be unworn/unused and in the same condition you received them.' },
      { q: 'How do I request a return?', a: 'Go to My Account → Orders → select the order → click "Request Return". Describe the issue and attach photos. Our team reviews returns within 24 hours on business days.' },
      { q: 'When will I get my refund?', a: 'Once the return is approved and the item is received by the seller, your refund is processed within 3–5 business days back to your original payment method. M-Pesa refunds are usually instant once processed.' },
      { q: 'What items cannot be returned?', a: 'Items marked "Final Sale", underwear and swimwear (for hygiene), customised or personalised items, and items that have been clearly used beyond inspection cannot be returned.' },
      { q: 'What if the seller disputes my return?', a: 'Our support team will review photos and the original listing to make a fair decision. gikomba.shop\'s decision is final. If we rule in your favour, you\'ll receive a full refund regardless of the seller\'s position.' },
    ],
  },
  {
    category: 'Selling on gikomba.shop',
    items: [
      { q: 'How do I become a seller?', a: 'Sign up for an account, select "Seller" during registration, complete your store profile, and submit your first listing for approval. Once approved, your products go live and are visible to all buyers.' },
      { q: 'Is there a fee to sell?', a: 'Listing is free. We charge a 5% commission on each completed sale, deducted automatically before your payout. There are no monthly fees or listing charges.' },
      { q: 'How and when do I get paid?', a: 'Payouts are sent via M-Pesa within 2–3 business days of order completion (after the buyer confirms receipt or the 7-day window closes). You\'ll receive a notification when the payout is sent.' },
      { q: 'My product listing is pending — what does that mean?', a: 'All new listings go through a quick quality review before going live. This typically takes 24–48 hours. We check that your photos are clear, the description is accurate, and the item meets our listing standards.' },
      { q: 'What quality grades should I use?', a: 'Grade A: like new, no visible wear. Grade B: light use, minor signs of wear. Grade C: noticeable wear but fully functional. Always grade honestly — misgrading leads to returns and account penalties.' },
    ],
  },
  {
    category: 'Account & Safety',
    items: [
      { q: 'How do I reset my password?', a: 'Click "Sign In" → "Forgot Password" and enter your email. You\'ll receive a reset link within a few minutes. Check spam if it doesn\'t arrive. The link expires after 1 hour.' },
      { q: 'How do I delete my account?', a: 'Email privacy@gikomba.shop with the subject "Delete My Account". We\'ll process the request within 7 business days. Note: you must resolve any outstanding orders before deletion.' },
      { q: 'I think my account has been hacked. What do I do?', a: 'Immediately change your password via the Forgot Password flow. Then email security@gikomba.shop. We\'ll review recent activity on your account and help you secure it.' },
      { q: 'How do you verify sellers?', a: 'Every seller goes through an ID verification process before their store is activated. We check their national ID or passport and phone number. Verified sellers display a verification badge on their store page.' },
      { q: 'What should I do if a seller asks me to pay outside the platform?', a: 'Never pay outside gikomba.shop. If a seller asks you to send M-Pesa directly to them, report it immediately to support@gikomba.shop. Off-platform payments are not covered by Buyer Protection.' },
    ],
  },
]

export default function FAQPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-3">Frequently Asked Questions</h1>
            <p className="text-muted-foreground text-lg">Everything you need to know about buying and selling on gikomba.shop.</p>
          </div>

          <div className="space-y-12">
            {faqs.map(({ category, items }) => (
              <div key={category}>
                <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-border">{category}</h2>
                <div className="space-y-6">
                  {items.map(({ q, a }) => (
                    <div key={q}>
                      <h3 className="font-semibold text-foreground mb-2">{q}</h3>
                      <p className="text-muted-foreground leading-relaxed text-sm">{a}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 p-8 bg-muted rounded-2xl text-center">
            <h2 className="text-xl font-bold mb-2">Still have a question?</h2>
            <p className="text-muted-foreground mb-6">Our support team is available Monday–Saturday, 8am–8pm EAT.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/contact" className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Contact Support</Link>
              <a href="https://wa.me/254736906440" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-md border border-border px-6 py-2 text-sm font-medium hover:bg-muted">WhatsApp Us</a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
