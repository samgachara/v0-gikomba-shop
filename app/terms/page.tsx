import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
export const metadata = { title: 'Terms of Service - gikomba.shop' }
export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 2026</p>
          {[
            { h: '1. Acceptance of Terms', p: 'By accessing and using gikomba.shop, you accept and agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our platform.' },
            { h: '2. Account Registration', p: 'You must create an account to buy or sell on gikomba.shop. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must be at least 18 years old to create an account.' },
            { h: '3. Buyer Responsibilities', p: 'As a buyer, you agree to provide accurate payment and shipping information, pay for items you purchase, and communicate respectfully with sellers. You agree not to engage in fraudulent purchases or chargebacks without legitimate reason.' },
            { h: '4. Seller Responsibilities', p: 'As a seller, you agree to list only items you own and have the right to sell, provide accurate product descriptions and images, fulfil orders promptly, and comply with all applicable Kenyan laws regarding the sale of goods.' },
            { h: '5. Prohibited Items', p: 'You may not list or sell counterfeit goods, illegal items, weapons, drugs, adult content, or any items that violate Kenyan law. gikomba.shop reserves the right to remove any listing at our discretion.' },
            { h: '6. Fees and Payments', p: 'gikomba.shop charges a 5% commission on completed sales. Buyers pay the listed price plus applicable shipping. All prices are in Kenyan Shillings (KSh).' },
            { h: '7. Dispute Resolution', p: 'In case of disputes between buyers and sellers, please contact our support team. gikomba.shop will mediate disputes but is not liable for transactions between users.' },
            { h: '8. Limitation of Liability', p: 'gikomba.shop is not liable for any indirect, incidental, or consequential damages arising from your use of our platform. Our total liability shall not exceed the amount you paid for the transaction in question.' },
          ].map(({ h, p }) => (
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
