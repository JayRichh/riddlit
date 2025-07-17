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

export const metadata: Metadata = {
  title: 'Riddlix | Challenge Minds. Build Teams. Rise Up.',
  description:
    'Daily team riddles for sharper thinking and smarter teams. Join or create teams, solve challenges, and climb the leaderboard.',
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
