import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import { getPublicTeams, getUserTeams } from '@/lib/actions/db/teams-actions'

import { TeamsContent } from './_components/teams-content'
import { TeamsSkeleton } from './_components/teams-skeleton'

export default async function TeamsPage() {
  const { userId } = await auth()

  if (!userId) {
    return redirect('/login')
  }

  return (
    <div className="space-y-6">
      {/* <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Teams</h1>
      </div> */}

      <Suspense fallback={<TeamsSkeleton />}>
        <TeamsContentWrapper />
      </Suspense>
    </div>
  )
}

async function TeamsContentWrapper() {
  const [userTeamsResult, publicTeamsResult] = await Promise.all([getUserTeams(), getPublicTeams()])

  if (!userTeamsResult.isSuccess || !publicTeamsResult.isSuccess) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Failed to load teams data</p>
      </div>
    )
  }

  return <TeamsContent userTeams={userTeamsResult.data} publicTeams={publicTeamsResult.data} />
}
