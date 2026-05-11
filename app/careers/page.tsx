import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import Link from 'next/link'

export const metadata = { title: 'Careers – gikomba.shop', description: 'Join the team building Kenya\'s most trusted online marketplace.' }

export default function CareersPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-3">Careers at gikomba.shop</h1>
            <p className="text-muted-foreground text-lg">We're building Kenya's most trusted marketplace. If that excites you, we'd love to hear from you.</p>
          </div>

          {/* Values */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">How We Work</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: 'Kenya-first', desc: 'Everything we build is designed for the Kenyan market. We understand local payments, local logistics, and local buyer behaviour.' },
                { title: 'Ownership', desc: 'Small team, big responsibility. Every person owns their domain and makes real decisions that affect real users.' },
                { title: 'Trust-obsessed', desc: 'We believe the biggest problem in African e-commerce is trust. Everything we build is designed to solve that.' },
                { title: 'Remote-friendly', desc: 'We work from Nairobi but we\'re open to remote talent across East Africa for the right roles.' },
              ].map(({ title, desc }) => (
                <div key={title} className="p-6 bg-muted rounded-xl">
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Open roles */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Open Roles</h2>
            <div className="space-y-4">
              {[
                { title: 'Seller Acquisition Lead', type: 'Part-time / Commission', location: 'Nairobi', desc: 'Find and onboard quality sellers onto gikomba.shop. You\'ll be the face of the platform to vendors in Gikomba, Kamukunji, and Eastleigh. Commission-based with performance bonuses.' },
                { title: 'Customer Support Associate', type: 'Part-time', location: 'Remote (Kenya)', desc: 'Handle buyer and seller queries via WhatsApp, email, and phone. Monday–Saturday. Strong communication skills in English and Swahili required.' },
                { title: 'Delivery Partner', type: 'Contract', location: 'Nairobi', desc: 'Own a motorbike and want reliable work? We\'re building a network of trusted delivery riders for same-day Nairobi deliveries. Flexible hours, competitive per-delivery rate.' },
              ].map(({ title, type, location, desc }) => (
                <div key={title} className="p-6 border border-border rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <h3 className="font-semibold text-lg">{title}</h3>
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{type}</span>
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{location}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* General applications */}
          <div className="p-8 bg-muted rounded-2xl text-center">
            <h2 className="text-xl font-bold mb-2">Don't see your role?</h2>
            <p className="text-muted-foreground text-sm mb-6">We're always open to meeting great people. Send your CV and a short note about what you'd like to work on.</p>
            <a href="mailto:careers@gikomba.shop" className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Send an Open Application</a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
