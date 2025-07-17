import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import { NotificationsContent } from './_components/notifications-content'
import { NotificationsSkeleton } from './_components/notifications-skeleton'

export default async function NotificationsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<NotificationsSkeleton />}>
        <NotificationsContent />
      </Suspense>
    </div>
  )
}
