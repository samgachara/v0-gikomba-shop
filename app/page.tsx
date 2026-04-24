import { Header } from "@/components/header"
export const metadata = {
  title: 'gikomba.shop — Kenya\'s Trusted Online Marketplace',
  description: 'Buy and sell quality products online in Kenya. M-Pesa payments, verified sellers, 7-day returns and delivery to all 47 counties. Shop fashion, electronics, home goods and more.',
}

import { Hero } from "@/components/hero"
import { Categories } from "@/components/categories"
import { Products } from "@/components/products"
import { Features } from "@/components/features"
import { Testimonials } from "@/components/testimonials"
import { Newsletter } from "@/components/newsletter"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <Categories />
        <Products />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
    </div>
  )
}
