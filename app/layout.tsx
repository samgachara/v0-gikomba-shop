import type { Metadata } from 'next'
import { DM_Sans, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import { CartProvider } from '@/lib/cart-context'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://gikomba.shop'),
  title: {
    default: 'Gikomba Shop – Affordable Fashion for Kenya',
    template: '%s | Gikomba Shop',
  },
  description:
    'Shop affordable fashion, electronics, and home goods at gikomba.shop. Quality products at unbeatable prices, delivered across Kenya with M-Pesa.',
  keywords: ['online shopping Kenya', 'Gikomba', 'fashion Kenya', 'M-Pesa shopping', 'electronics Kenya'],
  openGraph: {
    title: 'Gikomba Shop – Affordable Fashion for Kenya',
    description:
      "Kenya's favorite online marketplace. Quality products at unbeatable prices, delivered to your doorstep.",
    url: 'https://gikomba.shop',
    siteName: 'Gikomba Shop',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Gikomba Shop – Kenya\'s Favorite Online Marketplace',
      },
    ],
    locale: 'en_KE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gikomba Shop – Affordable Fashion for Kenya',
    description: "Kenya's favorite online marketplace.",
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${spaceGrotesk.variable} font-sans antialiased`}
      >
        <AuthProvider>
          <CartProvider>
            {children}
            <Analytics />
            <Toaster position="top-right" richColors />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
