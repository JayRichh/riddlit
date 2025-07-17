import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { getProfileByUserId } from '@/lib/actions/db/profiles'
import { AppSidebar } from '@/lib/components/sidebar/app-sidebar'
import { SidebarProvider } from '@/lib/components/ui/sidebar'

import { LeaderboardNavbar } from './_components/leaderboard-navbar'

export const metadata = {
  title: 'Leaderboard | Riddlix',
  description:
    'View rankings and statistics on Riddlix. Track top performers, team standings, and competitive statistics in our riddle-solving community.',
  keywords: [
    'leaderboard',
    'rankings',
    'statistics',
    'top performers',
    'team standings',
    'competition',
    'riddle champions',
    'performance tracking',
  ],
  openGraph: {
    title: 'Leaderboard | Riddlix',
    description:
      'View rankings and statistics on Riddlix. Track top performers, team standings, and competitive statistics in our riddle-solving community.',
    type: 'website',
    url: 'https://riddlix.vercel.app/leaderboard',
    images: [
      {
        url: '/riddlix_logo.png',
        width: 800,
        height: 600,
        alt: 'Riddlix Leaderboard - Rankings and Statistics',
      },
    ],
    siteName: 'Riddlix',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Leaderboard | Riddlix',
    description:
      'View rankings and statistics on Riddlix. Track top performers, team standings, and competitive statistics in our riddle-solving community.',
    images: ['/riddlix_logo.png'],
  },
  alternates: {
    canonical: 'https://riddlix.vercel.app/leaderboard',
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
