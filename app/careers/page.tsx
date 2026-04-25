import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import Link from 'next/link'
export const metadata = {
  title: 'Careers at gikomba.shop — Join Our Team',
  description: "Join the team building Kenya's trusted online marketplace. We're a small, passionate team working hard to empower Kenyan traders and shoppers.",
}
export default function CareersPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">Join Our Team</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Help us build Kenya&apos;s most beloved marketplace. We&apos;re a small, passionate team working hard to empower Kenyan traders and shoppers.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-16 text-center">
            {[['🇰🇪','Kenya First','We build for Kenyan realities, not Silicon Valley'],['🚀','Move Fast','Ship real value for real people every week'],['🤝','Team Spirit','Small team, big mission, genuine camaraderie']].map(([e,t,d]) => (
              <div key={t} className="p-6 border border-border rounded-xl">
                <div className="text-4xl mb-3">{e}</div>
                <p className="font-semibold mb-2">{t}</p>
                <p className="text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">Roles We Typically Hire For</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: 'Software Engineers', desc: 'Frontend (Next.js/React) and backend (Node.js, PostgreSQL). We build in public and ship fast.' },
                { title: 'Customer Support', desc: 'WhatsApp-first support. Empathetic, fast, and solutions-focused. Nairobi-based preferred.' },
                { title: 'Seller Partnerships', desc: 'Onboarding and growing our seller community across Kenya. Relationships and hustle required.' },
                { title: 'Digital Marketing', desc: 'TikTok, Instagram, WhatsApp commerce. We want creators who understand the Kenyan market.' },
              ].map(({ title, desc }) => (
                <div key={title} className="p-5 border border-border rounded-xl">
                  <p className="font-semibold mb-1">{title}</p>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center p-12 bg-primary/5 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4">No Open Roles Right Now</h2>
            <p className="text-muted-foreground mb-6">We&apos;re a small team but always looking for exceptional people. Send us your CV — when we hire, we go to our waitlist first.</p>
            <Link href="/contact" className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Send Your CV
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
