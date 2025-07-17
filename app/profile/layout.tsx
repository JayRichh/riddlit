import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { getProfileByUserId } from '@/lib/actions/db/profiles'
import { AppSidebar } from '@/lib/components/sidebar/app-sidebar'
import { SidebarProvider } from '@/lib/components/ui/sidebar'

import { ProfileNavbar } from './_components/profile-navbar'

export const metadata = {
  title: 'Profile | Riddlix',
  description:
    'View and manage your profile on Riddlix. Update your settings, track your progress, and customize your riddle-solving experience.',
  openGraph: {
    title: 'Profile | Riddlix',
    description:
      'View and manage your profile on Riddlix. Update your settings, track your progress, and customize your riddle-solving experience.',
    type: 'website',
    url: 'https://riddlix.vercel.app/profile',
    images: [
      {
        url: '/riddlix_logo.png',
        width: 800,
        height: 600,
        alt: 'Riddlix Profile - User Settings',
      },
    ],
    siteName: 'Riddlix',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Profile | Riddlix',
    description:
      'View and manage your profile on Riddlix. Update your settings, track your progress, and customize your riddle-solving experience.',
    images: ['/riddlix_logo.png'],
  },
  alternates: {
    canonical: 'https://riddlix.vercel.app/profile',
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
