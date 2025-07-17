import React from 'react'

import Header from '@/lib/components/header'

export const metadata = {
  title: 'Riddlix | Challenge Minds. Build Teams. Rise Up.',
  description:
    'Daily team riddles for sharper thinking and smarter teams. Join or create teams, solve challenges, and climb the leaderboard.',
  keywords:
    'riddles, team building, puzzles, challenges, leaderboard, team competition, brain teasers',
  openGraph: {
    title: 'Riddlix | Challenge Minds. Build Teams. Rise Up.',
    description: 'Daily team riddles for sharper thinking and smarter teams.',
    type: 'website',
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
