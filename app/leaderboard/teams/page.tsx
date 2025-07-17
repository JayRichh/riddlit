import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import { getTeamLeaderboard } from '@/lib/actions/db/leaderboard-actions'

import { LeaderboardSkeleton } from '../_components/leaderboard-skeleton'
import { TeamLeaderboardContent } from '../_components/team-leaderboard-content'

export default async function TeamLeaderboardPage() {
  const { userId } = await auth()

  if (!userId) {
    return redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Team Leaderboard</h1>
      </div>

      <Suspense fallback={<LeaderboardSkeleton />}>
        <TeamLeaderboardContentWrapper />
      </Suspense>
    </div>
  )
}

async function TeamLeaderboardContentWrapper() {
  const leaderboardResult = await getTeamLeaderboard()

  if (!leaderboardResult.isSuccess) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Failed to load team leaderboard</p>
      </div>
    )
  }

  return <TeamLeaderboardContent leaderboard={leaderboardResult.data} />
}
