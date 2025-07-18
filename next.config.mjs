/*
<ai_context>
Configures Next.js for the app.
</ai_context>
*/

import NextBundleAnalyzer from '@next/bundle-analyzer'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ hostname: 'localhost' }, { hostname: '*.public.blob.vercel-storage.com' }],
    formats: ['image/webp', 'image/avif'],
  },
  turbopack: {
    // Turbopack configuration - moved from experimental.turbo
  },
}

const withBundleAnalyzer = NextBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default withBundleAnalyzer(nextConfig)
