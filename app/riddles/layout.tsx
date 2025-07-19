import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { getProfileByUserId } from '@/lib/actions/db/profiles'
import { AppSidebar } from '@/lib/components/sidebar/app-sidebar'
import { SidebarProvider } from '@/lib/components/ui/sidebar'

import { ImprovedRiddlesNavbar } from './_components/improved-riddles-navbar'

export const metadata = {
  title: 'Riddles',
  description:
    'Browse and solve challenging riddles on Riddlit. Test your problem-solving skills with brain teasers, puzzles, and mind games designed for team collaboration.',
  openGraph: {
    url: 'https://riddl.it/riddles',
    images: [
      {
        url: '/riddlit_logo.png',
        width: 1200,
        height: 630,
        alt: 'Riddlit Riddles - Brain Teasers and Puzzles',
        type: 'image/png',
      },
    ],
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
