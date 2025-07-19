import './globals.css'

import { ClerkProvider } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { createProfile, getProfileByUserId } from '@/lib/actions/db/profiles'
import { Toaster } from '@/lib/components/ui/sonner'
import { Providers } from '@/lib/components/utilities/providers'
import { TailwindIndicator } from '@/lib/components/utilities/tailwind-indicator'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://riddl.it'),
  title: {
    default: 'Riddlix | Challenge Minds. Build Teams. Rise Up.',
    template: '%s | Riddlix',
  },
  description:
    'Daily team riddles for sharper thinking and smarter teams. Join or create teams, solve challenges, and climb the leaderboard.',
  keywords: [
    'riddles',
    'team building',
    'puzzles',
    'challenges',
    'leaderboard',
    'team competition',
    'brain teasers',
    'mind games',
    'problem solving',
    'team collaboration',
  ],
  authors: [{ name: 'Riddlix' }],
  creator: 'Riddlix',
  publisher: 'Riddlix',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://riddl.it',
    title: 'Riddlix | Challenge Minds. Build Teams. Rise Up.',
    description:
      'Daily team riddles for sharper thinking and smarter teams. Join or create teams, solve challenges, and climb the leaderboard.',
    images: [
      {
        url: '/riddlix_logo.png',
        width: 1200,
        height: 630,
        alt: 'Riddlix - Challenge Minds. Build Teams. Rise Up.',
        type: 'image/png',
      },
    ],
    siteName: 'Riddlix',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@riddlix',
    creator: '@riddlix',
    title: 'Riddlix | Challenge Minds. Build Teams. Rise Up.',
    description:
      'Daily team riddles for sharper thinking and smarter teams. Join or create teams, solve challenges, and climb the leaderboard.',
    images: [
      {
        url: '/riddlix_logo.png',
        alt: 'Riddlix - Challenge Minds. Build Teams. Rise Up.',
      },
    ],
  },
  alternates: {
    canonical: 'https://riddl.it',
  },
  category: 'Game',
  classification: 'Team Building Game',
  other: {
    'msapplication-TileColor': '#000000',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()

  if (userId) {
    const profileRes = await getProfileByUserId(userId)

    if (!profileRes.isSuccess) {
      await createProfile({ userId })
    }
  }

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Organization',
                '@id': 'https://riddl.it/#organization',
                name: 'Riddlix',
                url: 'https://riddl.it',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://riddl.it/riddlix_logo.png',
                  width: 800,
                  height: 600,
                },
                description:
                  'Daily team riddles for sharper thinking and smarter teams. Join or create teams, solve challenges, and climb the leaderboard.',
                foundingDate: '2025',
                serviceType: [
                  'Team Building',
                  'Brain Training',
                  'Puzzle Games',
                  'Educational Games',
                ],
                applicationCategory: 'GameApplication',
                operatingSystem: 'Web Browser',
              }),
            }}
          />

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                '@id': 'https://riddl.it/#website',
                url: 'https://riddl.it',
                name: 'Riddlix',
                description: 'Daily team riddles for sharper thinking and smarter teams',
                publisher: {
                  '@id': 'https://riddl.it/#organization',
                },
                inLanguage: 'en-US',
              }),
            }}
          />

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'WebApplication',
                name: 'Riddlix',
                url: 'https://riddl.it',
                description:
                  'Daily team riddles for sharper thinking and smarter teams. Join or create teams, solve challenges, and climb the leaderboard.',
                applicationCategory: 'GameApplication',
                operatingSystem: 'Web Browser',
                author: {
                  '@type': 'Organization',
                  name: 'Riddlix',
                },
                offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
                },
              }),
            }}
          />
        </head>
        <body
          className={cn(
            'bg-background mx-auto min-h-screen w-full scroll-smooth antialiased',
            inter.className,
          )}
        >
          <Providers
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}

            <TailwindIndicator />

            <Toaster />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}
