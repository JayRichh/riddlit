import React from 'react'

import Header from '@/lib/components/header'

export const metadata = {
  title: 'Riddlix | Challenge Minds. Build Teams. Rise Up.',
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
  openGraph: {
    title: 'Riddlix | Challenge Minds. Build Teams. Rise Up.',
    description:
      'Daily team riddles for sharper thinking and smarter teams. Join or create teams, solve challenges, and climb the leaderboard.',
    type: 'website',
    url: 'https://riddlix.vercel.app',
    images: [
      {
        url: '/riddlix_logo.png',
        width: 800,
        height: 600,
        alt: 'Riddlix - Challenge Minds. Build Teams. Rise Up.',
      },
    ],
    siteName: 'Riddlix',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Riddlix | Challenge Minds. Build Teams. Rise Up.',
    description:
      'Daily team riddles for sharper thinking and smarter teams. Join or create teams, solve challenges, and climb the leaderboard.',
    images: ['/riddlix_logo.png'],
  },
  alternates: {
    canonical: 'https://riddlix.vercel.app',
  },
}

export default async function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="flex-1">{children}</div>
    </div>
  )
}
