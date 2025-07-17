import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { getProfileByUserId } from '@/lib/actions/db/profiles'
import { AppSidebar } from '@/lib/components/sidebar/app-sidebar'
import { SidebarProvider } from '@/lib/components/ui/sidebar'

import { DashboardNavbar } from './_components/dashboard-navbar'

export const metadata = {
  title: 'Dashboard | Riddlix',
  description:
    'Your Riddlix dashboard with stats and activity. Track your progress, view team performance, and manage your riddle-solving journey.',
  openGraph: {
    title: 'Dashboard | Riddlix',
    description:
      'Your Riddlix dashboard with stats and activity. Track your progress, view team performance, and manage your riddle-solving journey.',
    type: 'website',
    url: 'https://riddlix.vercel.app/dashboard',
    images: [
      {
        url: '/riddlix_logo.png',
        width: 800,
        height: 600,
        alt: 'Riddlix Dashboard',
      },
    ],
    siteName: 'Riddlix',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dashboard | Riddlix',
    description:
      'Your Riddlix dashboard with stats and activity. Track your progress, view team performance, and manage your riddle-solving journey.',
    images: ['/riddlix_logo.png'],
  },
  alternates: {
    canonical: 'https://riddlix.vercel.app/dashboard',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
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
          <DashboardNavbar />
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
