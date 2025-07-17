import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import { AdminNotificationsContent } from './_components/admin-notifications-content'
import { AdminNotificationsSkeleton } from './_components/admin-notifications-skeleton'

export default async function AdminNotificationsPage() {
  const { userId } = await auth()

  if (!userId) {
    return redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notification Management</h1>
          <p className="text-muted-foreground">
            Manage system notifications, announcements, and user notifications
          </p>
        </div>
      </div>

      <Suspense fallback={<AdminNotificationsSkeleton />}>
        <AdminNotificationsContent />
      </Suspense>
    </div>
  )
}
