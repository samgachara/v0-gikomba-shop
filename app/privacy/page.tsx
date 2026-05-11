import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export const metadata = { title: 'Privacy Policy - gikomba.shop', description: 'How gikomba.shop collects, uses, and protects your personal data.' }

const sections = [
  { h: '1. Who We Are', p: 'gikomba.shop is an online marketplace operated from Nairobi, Kenya. We connect buyers and sellers of second-hand and new goods across Kenya. When we say "we", "us", or "gikomba.shop" in this policy, we mean the platform and its operators. You can reach us at privacy@gikomba.shop.' },
  { h: '2. Information We Collect', p: 'We collect information you give us directly: your name, email address, phone number, delivery address, and payment details when you register or place an order. We also collect information automatically: your IP address, device type, browser, pages visited, time spent, and referring URLs. If you sign up with Google, we receive your name and email from Google.' },
  { h: '3. How We Use Your Information', p: 'We use your data to process and fulfil your orders, send order confirmations and delivery updates via SMS and email, provide customer support, personalise your shopping experience, detect and prevent fraud, improve the platform based on usage patterns, and send you promotional offers (only with your explicit consent). We never sell your personal information.' },
  { h: '4. Who We Share Your Data With', p: 'We share limited data with: sellers (only your first name, delivery address, and order details needed to fulfil your order), M-Pesa and card processors (to complete payments — they have their own privacy policies), delivery partners (your name, phone, and address), and Vercel (our hosting provider). All third parties are contractually required to protect your data and use it only for the stated purpose.' },
  { h: '5. Data Retention', p: 'We keep your account data for as long as your account is active. If you delete your account, we remove your personal data within 30 days, except where we are legally required to retain records (e.g. financial transaction records, which we keep for 7 years under Kenyan law). Order history is retained for dispute resolution purposes.' },
  { h: '6. Your Rights', p: 'Under Kenyan data protection law (Data Protection Act, 2019), you have the right to access your personal data, correct inaccurate data, request deletion of your data, object to certain processing, and withdraw consent for marketing at any time. To exercise any of these rights, email privacy@gikomba.shop. We respond within 7 business days.' },
  { h: '7. Cookies', p: 'We use essential cookies (to keep you logged in and your cart intact), performance cookies (anonymous analytics via Vercel), and preference cookies (to remember your settings). We do not use advertising or tracking cookies. See our Cookie Policy for full details.' },
  { h: '8. Security', p: 'We use HTTPS/TLS encryption on all pages, secure Supabase-managed databases with row-level security, and we never store raw payment card details. Passwords are hashed and salted. We conduct regular security reviews.' },
  { h: '9. Children', p: 'gikomba.shop is not intended for users under 18. We do not knowingly collect data from minors. If you believe a minor has created an account, contact us at privacy@gikomba.shop and we will delete it promptly.' },
  { h: '10. Changes to This Policy', p: 'We will notify you of significant changes to this policy via email and a notice on the site. Continued use of gikomba.shop after changes means you accept the updated policy.' },
  { h: '11. Contact', p: 'For privacy questions, data requests, or concerns: privacy@gikomba.shop. For urgent matters, WhatsApp: +254 736 906 440.' },
]

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-16 px-4">
        <div className="max-w-3xl mx-auto prose prose-slate">
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
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
