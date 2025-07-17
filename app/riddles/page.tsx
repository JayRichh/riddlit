import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import { getActiveRiddles } from '@/lib/actions/db/riddles-actions'

import { RiddlesContent } from './_components/riddles-content'
import { RiddlesSkeleton } from './_components/riddles-skeleton'

export default async function RiddlesPage() {
  const { userId } = await auth()

  if (!userId) {
    return redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Active Riddles</h1>
      </div>

      <Suspense fallback={<RiddlesSkeleton />}>
        <RiddlesContentWrapper />
      </Suspense>
    </div>
  )
}

async function RiddlesContentWrapper() {
  const riddlesResult = await getActiveRiddles()

  if (!riddlesResult.isSuccess) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Failed to load riddles</p>
      </div>
    )
  }

  return <RiddlesContent riddles={riddlesResult.data} />
}
