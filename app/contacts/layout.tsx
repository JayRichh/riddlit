import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { getProfileByUserId } from '@/lib/actions/db/profiles'
import { AppSidebar } from '@/lib/components/sidebar/app-sidebar'
import { SidebarProvider } from '@/lib/components/ui/sidebar'

import { ContactsNavbar } from './_components/contacts-navbar'

export const metadata = {
  title: 'Contacts',
  description:
    'Manage your contacts and team connections on Riddlit. Connect with teammates, build your network, and strengthen collaboration.',
  openGraph: {
    url: 'https://www.riddl.it/contacts',
    images: [
      {
        url: '/riddlit_logo.png',
        width: 1200,
        height: 630,
        alt: 'Riddlit Contacts - Team Connections',
        type: 'image/png',
      },
    ],
  },
  alternates: {
    canonical: 'https://www.riddl.it/contacts',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default async function ContactsLayout({ children }: { children: React.ReactNode }) {
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
          <ContactsNavbar />
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
