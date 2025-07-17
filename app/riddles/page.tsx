import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import { getActiveRiddles } from '@/lib/actions/db/riddles-actions'
import { getUserTeams } from '@/lib/actions/db/teams-actions'

import { ImprovedRiddlesContent } from './_components/improved-riddles-content'
import { RiddlesSkeleton } from './_components/riddles-skeleton'

export default async function RiddlesPage() {
  const { userId } = await auth()

  if (!userId) {
    return redirect('/login')
  }

  return (
    <Suspense fallback={<RiddlesSkeleton />}>
      <RiddlesContentWrapper />
    </Suspense>
  )
}

async function RiddlesContentWrapper() {
  // Fetch public riddles (no team filter)
  const publicRiddlesResult = await getActiveRiddles()

  // Fetch user teams
  const userTeamsResult = await getUserTeams()

  // Fetch team riddles - we'll get all team riddles for user's teams
  const teamRiddlesResult = await getActiveRiddles('user-teams')

  if (!publicRiddlesResult.isSuccess) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Failed to load riddles</p>
      </div>
    )
  }

  const publicRiddles = publicRiddlesResult.data
  const userTeams = userTeamsResult.isSuccess ? userTeamsResult.data : []
  const teamRiddles = teamRiddlesResult.isSuccess ? teamRiddlesResult.data : []

  return (
    <ImprovedRiddlesContent
      publicRiddles={publicRiddles}
      teamRiddles={teamRiddles}
      userTeams={userTeams}
    />
  )
}
