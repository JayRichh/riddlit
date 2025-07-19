import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { getProfileByUserId } from '@/lib/actions/db/profiles'
import { AppSidebar } from '@/lib/components/sidebar/app-sidebar'
import { SidebarProvider } from '@/lib/components/ui/sidebar'

import { DashboardNavbar } from './_components/dashboard-navbar'

export const metadata = {
  title: 'Dashboard',
  description:
    'Your Riddlix dashboard with stats and activity. Track your progress, view team performance, and manage your riddle-solving journey.',
  openGraph: {
    url: 'https://riddl.it/dashboard',
    images: [
      {
        url: '/riddlix_logo.png',
        width: 1200,
        height: 630,
        alt: 'Riddlix Dashboard',
        type: 'image/png',
      },
    ],
  },
  alternates: {
    canonical: 'https://riddl.it/dashboard',
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
