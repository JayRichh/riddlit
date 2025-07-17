import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { getProfileByUserId } from '@/lib/actions/db/profiles'
import { AppSidebar } from '@/lib/components/sidebar/app-sidebar'
import { SidebarProvider } from '@/lib/components/ui/sidebar'

import { AdminNavbar } from './_components/admin-navbar'

export const metadata = {
  title: 'Admin | Riddlix',
  description:
    'Admin panel for managing Riddlix content. Control riddles, manage teams, and oversee community activities.',
  openGraph: {
    title: 'Admin | Riddlix',
    description:
      'Admin panel for managing Riddlix content. Control riddles, manage teams, and oversee community activities.',
    type: 'website',
    url: 'https://riddlix.vercel.app/admin',
    images: [
      {
        url: '/riddlix_logo.png',
        width: 800,
        height: 600,
        alt: 'Riddlix Admin Panel',
      },
    ],
    siteName: 'Riddlix',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Admin | Riddlix',
    description:
      'Admin panel for managing Riddlix content. Control riddles, manage teams, and oversee community activities.',
    images: ['/riddlix_logo.png'],
  },
  alternates: {
    canonical: 'https://riddlix.vercel.app/admin',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()

  if (!userId) {
    return redirect('/login')
  }

  const { data: profile } = await getProfileByUserId(userId)

  if (!profile) {
    return redirect('/signup')
  }

  // Check if user has pro access (admin functionality for pro users)
  if (profile.membership !== 'pro') {
    return redirect('/dashboard')
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminNavbar />
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
