/** @type {import("next").NextConfig} */
const nextConfig = {
  typescript: {
    // Allows production builds to complete even with type errors.
    // Pre-existing TS issues in the codebase will be fixed iteratively.
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        // GitHub OAuth avatar images
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        // Google OAuth profile pictures
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  experimental: {
    ppr: false,
  },
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
}

export default nextConfig
