import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export const metadata = { title: 'Terms of Service - gikomba.shop', description: 'Terms and conditions for buying and selling on gikomba.shop.' }

const sections = [
  { h: '1. Acceptance of Terms', p: 'By creating an account or making a purchase on gikomba.shop, you agree to these Terms of Service and our Privacy Policy. If you do not agree, do not use the platform. These terms are governed by the laws of Kenya.' },
  { h: '2. Eligibility', p: 'You must be at least 18 years old to use gikomba.shop. By registering, you confirm that all information you provide is accurate and that you have the legal capacity to enter into contracts under Kenyan law.' },
  { h: '3. Buyer Responsibilities', p: 'As a buyer, you agree to: provide accurate delivery and payment information, pay in full for items you purchase, not abuse the returns or dispute process, and treat sellers with respect. Fraudulent orders, false disputes, or chargebacks without legitimate reason may result in account suspension.' },
  { h: '4. Seller Responsibilities', p: 'As a seller, you agree to: list only items you legally own and have the right to sell, provide accurate descriptions, photos, and quality grades, fulfil orders within 48 hours of confirmation, communicate with buyers promptly, and comply with all applicable Kenyan laws. Misrepresenting products will result in immediate suspension and potential legal action.' },
  { h: '5. Prohibited Items', p: 'You may not list or sell: counterfeit or stolen goods, illegal weapons or drugs, adult or explicit content, endangered wildlife products, recalled or hazardous items, pirated software or media, or any items banned under Kenyan law. gikomba.shop may remove any listing at its sole discretion without notice.' },
  { h: '6. Fees and Commissions', p: 'gikomba.shop charges sellers a 5% commission on each completed sale. This is deducted automatically before payout. Buyers pay the listed price plus shipping. All prices are in Kenyan Shillings (KSh). Fees are subject to change with 30 days notice to active sellers.' },
  { h: '7. Payments', p: 'We accept M-Pesa, Visa, Mastercard, and Pay on Delivery (Nairobi only). Payments are held by gikomba.shop until the buyer confirms receipt or the 7-day protection window closes. Sellers receive payouts within 2-3 business days of order completion via M-Pesa.' },
  { h: '8. Shipping and Delivery', p: 'Delivery timelines are estimates, not guarantees. gikomba.shop partners with third-party couriers and is not liable for delays caused by the courier, weather, or circumstances outside our control. Sellers are responsible for packaging items securely.' },
  { h: '9. Returns and Refunds', p: 'Buyers have 7 days from delivery to request a return if the item is significantly different from the listing, damaged, or not received. See our Returns Policy for full details. Refunds are processed within 5-7 business days via the original payment method.' },
  { h: '10. Dispute Resolution', p: 'If a dispute arises between a buyer and seller, contact support@gikomba.shop within 7 days of the issue. gikomba.shop will mediate but the final decision rests with our support team. Unresolved disputes may be referred to the Consumer Federation of Kenya (COFEK).' },
  { h: '11. Intellectual Property', p: 'All content on gikomba.shop — including the logo, design, and code — is owned by gikomba.shop. You may not copy, reproduce, or use our brand assets without written permission. By listing products, sellers grant gikomba.shop a non-exclusive licence to display their product photos and descriptions.' },
  { h: '12. Limitation of Liability', p: 'gikomba.shop is a marketplace platform. We facilitate transactions but are not party to contracts between buyers and sellers. Our total liability for any claim shall not exceed the value of the transaction in question. We are not liable for indirect or consequential losses.' },
  { h: '13. Account Suspension', p: 'We may suspend or terminate accounts that violate these terms, engage in fraudulent activity, receive multiple legitimate complaints, or pose a risk to other users. Suspended users may appeal by emailing support@gikomba.shop within 14 days.' },
  { h: '14. Changes to Terms', p: 'We may update these terms from time to time. Significant changes will be communicated via email with 14 days notice. Continued use of the platform after that date constitutes acceptance of the new terms.' },
  { h: '15. Contact', p: 'Questions about these terms? Email legal@gikomba.shop or WhatsApp +254 736 906 440.' },
]

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: May 4, 2026</p>
          {sections.map(({ h, p }) => (
            <div key={h} className="mb-8">
              <h2 className="text-xl font-semibold mb-3">{h}</h2>
              <p className="text-muted-foreground leading-relaxed">{p}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}
