import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import { RiddleRequestsWrapper } from './_components/riddle-requests-wrapper'

export default async function AdminRiddleRequestsPage() {
  const { userId } = await auth()

  if (!userId) {
    return redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Riddle Requests</h1>
          <p className="text-muted-foreground">
            Review and manage riddle requests from team members
          </p>
        </div>
      </div>

      <Suspense fallback={<div>Loading riddle requests...</div>}>
        <RiddleRequestsWrapper />
      </Suspense>
    </div>
  )
}
