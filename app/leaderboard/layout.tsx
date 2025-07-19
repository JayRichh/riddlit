import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { getProfileByUserId } from '@/lib/actions/db/profiles'
import { AppSidebar } from '@/lib/components/sidebar/app-sidebar'
import { SidebarProvider } from '@/lib/components/ui/sidebar'

import { LeaderboardNavbar } from './_components/leaderboard-navbar'

export const metadata = {
  title: 'Leaderboard',
  description:
    'View rankings and statistics on Riddlit. Track top performers, team standings, and competitive statistics in our riddle-solving community.',
  openGraph: {
    url: 'https://www.riddl.it/leaderboard',
    images: [
      {
        url: '/riddlit_logo.png',
        width: 1200,
        height: 630,
        alt: 'Riddlit Leaderboard - Rankings and Statistics',
        type: 'image/png',
      },
    ],
  },
  alternates: {
    canonical: 'https://www.riddl.it/leaderboard',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default async function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()

  if (!userId) {
    return redirect('/login')
  }

  const { data: profile } = await getProfileByUserId(userId)

  if (!profile) {
    return redirect('/signup')
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <LeaderboardNavbar />
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
