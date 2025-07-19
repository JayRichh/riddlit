import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { getProfileByUserId } from '@/lib/actions/db/profiles'
import { AppSidebar } from '@/lib/components/sidebar/app-sidebar'
import { SidebarProvider } from '@/lib/components/ui/sidebar'

import { ImprovedRiddlesNavbar } from './_components/improved-riddles-navbar'

export const metadata = {
  title: 'Riddles | Riddlix',
  description:
    'Browse and solve challenging riddles on Riddlix. Test your problem-solving skills with brain teasers, puzzles, and mind games designed for team collaboration.',
  keywords: [
    'riddles',
    'puzzles',
    'brain teasers',
    'problem solving',
    'mind games',
    'challenges',
    'logic puzzles',
    'team riddles',
  ],
  openGraph: {
    title: 'Riddles | Riddlix',
    description:
      'Browse and solve challenging riddles on Riddlix. Test your problem-solving skills with brain teasers, puzzles, and mind games designed for team collaboration.',
    type: 'website',
    url: 'https://riddl.it/riddles',
    images: [
      {
        url: '/riddlix_logo.png',
        width: 800,
        height: 600,
        alt: 'Riddlix Riddles - Brain Teasers and Puzzles',
      },
    ],
    siteName: 'Riddlix',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Riddles | Riddlix',
    description:
      'Browse and solve challenging riddles on Riddlix. Test your problem-solving skills with brain teasers, puzzles, and mind games designed for team collaboration.',
    images: ['/riddlix_logo.png'],
  },
  alternates: {
    canonical: 'https://riddl.it/riddles',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default async function RiddlesLayout({ children }: { children: React.ReactNode }) {
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
          <ImprovedRiddlesNavbar />
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
