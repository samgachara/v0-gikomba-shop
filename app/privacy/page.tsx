import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
export const metadata = { title: 'Privacy Policy - gikomba.shop' }
export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-16 px-4">
        <div className="max-w-3xl mx-auto prose prose-slate">
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 2026</p>
          {[
            { h: '1. Information We Collect', p: 'We collect information you provide directly to us when you create an account, place an order, or contact us. This includes your name, email address, phone number, shipping address, and payment information. We also collect information automatically when you use our services, such as your IP address, browser type, and pages visited.' },
            { h: '2. How We Use Your Information', p: 'We use the information we collect to process transactions, send order confirmations and updates, provide customer support, send promotional communications (with your consent), improve our services, and comply with legal obligations. We never sell your personal information to third parties.' },
            { h: '3. Information Sharing', p: 'We share your information with sellers on our platform (limited to order fulfilment details), payment processors (M-Pesa, card processors) to complete transactions, delivery partners to fulfil your orders, and service providers who assist in our operations. All partners are contractually bound to protect your data.' },
            { h: '4. Data Security', p: 'We implement industry-standard security measures including SSL/TLS encryption, secure data storage, and regular security audits to protect your personal information. However, no method of internet transmission is 100% secure.' },
            { h: '5. Your Rights', p: 'You have the right to access, correct, or delete your personal data at any time. You can update your information in your account settings or contact us at privacy@gikomba.shop. You also have the right to opt out of marketing communications at any time.' },
            { h: '6. Cookies', p: 'We use cookies to enhance your shopping experience, remember your preferences, and understand how you use our platform. See our Cookie Policy for more details.' },
            { h: '7. Contact Us', p: 'For any privacy-related questions, please contact us at privacy@gikomba.shop or write to us at our Nairobi office.' },
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
