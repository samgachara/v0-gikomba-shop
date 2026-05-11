import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export const metadata = { title: 'Cookie Policy - gikomba.shop', description: 'How gikomba.shop uses cookies and how to manage them.' }

const sections = [
  { h: 'What Are Cookies?', p: 'Cookies are small text files placed on your device when you visit a website. They help the site remember who you are, keep you logged in, and understand how people use the platform so we can improve it. Cookies cannot access other files on your device or cause harm.' },
  { h: 'Essential Cookies', p: 'These cookies are required for gikomba.shop to work and cannot be turned off. They include: authentication cookies (so you stay logged in), session cookies (so your cart survives page changes), security cookies (to protect against CSRF attacks), and preference cookies (your currency and language settings). Without these, the site cannot function.' },
  { h: 'Performance and Analytics Cookies', p: 'We use Vercel Analytics to understand how visitors navigate our site — which pages are popular, where users drop off, and how long they spend on each section. This data is fully anonymous and aggregated. No personal data is stored. This helps us improve load times and the overall shopping experience.' },
  { h: 'What We Do NOT Use', p: 'We do not use advertising cookies, retargeting pixels (Facebook Pixel, Google Ads), third-party tracking cookies, or any cookies that track you across other websites. We do not sell cookie data to any third party.' },
  { h: 'Third-Party Cookies', p: 'Some features on gikomba.shop involve third parties that may set their own cookies: Google (if you sign in with Google), M-Pesa payment gateway (for payment processing only). These cookies are governed by the respective third party\'s privacy policy.' },
  { h: 'How Long Cookies Last', p: 'Session cookies: deleted when you close your browser. Authentication cookies: 7 days (or 30 days if you choose "Remember me"). Analytics cookies: 90 days, then reset. Preference cookies: 1 year.' },
  { h: 'Managing Cookies', p: 'You can control cookies in your browser settings. In Chrome: Settings → Privacy and Security → Cookies. In Safari: Preferences → Privacy. In Firefox: Settings → Privacy & Security. Note: disabling essential cookies will break core functions like login and checkout. We recommend only disabling non-essential cookies if you have concerns.' },
  { h: 'Changes to This Policy', p: 'We may update this Cookie Policy as our platform evolves. Any significant changes will be communicated via a notice on the site. Last updated: May 4, 2026.' },
  { h: 'Contact', p: 'Questions about our cookie practices? Email privacy@gikomba.shop.' },
]

export default function CookiesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Cookie Policy</h1>
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
