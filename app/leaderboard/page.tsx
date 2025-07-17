import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import { getIndividualLeaderboard } from '@/lib/actions/db/leaderboard-actions'

import { LeaderboardContent } from './_components/leaderboard-content'
import { LeaderboardSkeleton } from './_components/leaderboard-skeleton'

export default async function LeaderboardPage() {
  const { userId } = await auth()

  if (!userId) {
    return redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Individual Leaderboard</h1>
      </div>

      <Suspense fallback={<LeaderboardSkeleton />}>
        <LeaderboardContentWrapper />
      </Suspense>
    </div>
  )
}

async function LeaderboardContentWrapper() {
  const leaderboardResult = await getIndividualLeaderboard()

  if (!leaderboardResult.isSuccess) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Failed to load leaderboard</p>
      </div>
    )
  }

  return <LeaderboardContent leaderboard={leaderboardResult.data} />
}
