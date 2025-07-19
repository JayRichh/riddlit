import React from 'react'

import Header from '@/lib/components/header'

// Landing page uses the root layout metadata - no override needed
// This allows the root template system to work properly

export default async function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="flex-1">{children}</div>
    </div>
  )
}
