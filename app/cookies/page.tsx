import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
export const metadata = { title: 'Cookie Policy - gikomba.shop' }
export default function CookiesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Cookie Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 2026</p>
          {[
            { h: 'What Are Cookies?', p: 'Cookies are small text files stored on your device when you visit a website. They help us remember your preferences and improve your shopping experience.' },
            { h: 'Essential Cookies', p: 'These cookies are necessary for the website to function. They include session cookies that keep you logged in, shopping cart cookies, and security cookies. You cannot opt out of these.' },
            { h: 'Performance Cookies', p: 'We use analytics cookies (Vercel Analytics) to understand how visitors interact with our site. This helps us improve performance and user experience. These cookies are anonymous.' },
            { h: 'Functional Cookies', p: 'These remember your preferences such as your preferred language, currency display, and saved addresses to make shopping faster.' },
            { h: 'Managing Cookies', p: 'You can control cookies through your browser settings. Note that disabling certain cookies may affect the functionality of gikomba.shop. Most browsers allow you to block or delete cookies.' },
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
