import path from 'node:path'
import { fileURLToPath } from 'node:url'

const workspaceRoot = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'ecrttmokkmaqdlsxhlvv.supabase.co' },
      { protocol: 'https', hostname: 'i.imgur.com' },       // ← seller image hosting
      { protocol: 'https', hostname: 'imgur.com' },
      { protocol: 'https', hostname: '*.supabase.co' },     // ← all Supabase storage
    ],
  },
  experimental: { ppr: false },
  turbopack: {
    root: workspaceRoot,
  },
  async redirects() {
    return [
      { source: '/categories',      destination: '/shop#categories', permanent: true },
      { source: '/products',        destination: '/shop',            permanent: true },
      { source: '/new-arrivals',    destination: '/shop?filter=new',         permanent: true },
      { source: '/best-sellers',    destination: '/shop?filter=bestsellers', permanent: true },
      { source: '/sale',            destination: '/shop?filter=sale',        permanent: true },
      { source: '/become-a-seller', destination: '/auth/sign-up',            permanent: false },
      { source: '/privacy-policy',  destination: '/privacy', permanent: true },
      { source: '/terms-of-service',destination: '/terms',   permanent: true },
      { source: '/cookie-policy',   destination: '/cookies', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options',    value: 'nosniff' },
          { key: 'X-Frame-Options',           value: 'DENY' },
          { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

export default nextConfig
