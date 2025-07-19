import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { getProfileByUserId } from '@/lib/actions/db/profiles'
import { AppSidebar } from '@/lib/components/sidebar/app-sidebar'
import { SidebarProvider } from '@/lib/components/ui/sidebar'

import { ProfileNavbar } from './_components/profile-navbar'

export const metadata = {
  title: 'Profile',
  description:
    'View and manage your profile on Riddlit. Update your settings, track your progress, and customize your riddle-solving experience.',
  openGraph: {
    url: 'https://riddl.it/profile',
    images: [
      {
        url: '/riddlit_logo.png',
        width: 1200,
        height: 630,
        alt: 'Riddlit Profile - User Settings',
        type: 'image/png',
      },
    ],
  },
  alternates: {
    canonical: 'https://riddl.it/profile',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
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
          <ProfileNavbar />
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
