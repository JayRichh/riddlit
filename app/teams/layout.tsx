import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { getProfileByUserId } from '@/lib/actions/db/profiles'
import { AppSidebar } from '@/lib/components/sidebar/app-sidebar'
import { SidebarProvider } from '@/lib/components/ui/sidebar'

import { TeamsNavbar } from './_components/teams-navbar'

export const metadata = {
  title: 'Teams | Riddlix',
  description:
    'Browse and manage teams on Riddlix. Join existing teams or create your own to compete in riddle challenges and climb the leaderboard together.',
  keywords: [
    'teams',
    'team building',
    'team collaboration',
    'riddle teams',
    'team competition',
    'group challenges',
    'team management',
    'collaborative solving',
  ],
  openGraph: {
    title: 'Teams | Riddlix',
    description:
      'Browse and manage teams on Riddlix. Join existing teams or create your own to compete in riddle challenges and climb the leaderboard together.',
    type: 'website',
    url: 'https://riddl.it/teams',
    images: [
      {
        url: '/riddlix_logo.png',
        width: 800,
        height: 600,
        alt: 'Riddlix Teams - Team Building and Collaboration',
      },
    ],
    siteName: 'Riddlix',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Teams | Riddlix',
    description:
      'Browse and manage teams on Riddlix. Join existing teams or create your own to compete in riddle challenges and climb the leaderboard together.',
    images: ['/riddlix_logo.png'],
  },
  alternates: {
    canonical: 'https://riddl.it/teams',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default async function TeamsLayout({ children }: { children: React.ReactNode }) {
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
          <TeamsNavbar />
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
