import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import { getTeamBySlug, getTeamMembers } from '@/lib/actions/db/teams-actions'

import { TeamDetailContent } from '../_components/team-detail-content'
import { TeamDetailSkeleton } from '../_components/team-detail-skeleton'

interface TeamPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { userId } = await auth()

  if (!userId) {
    return redirect('/login')
  }

  const { slug } = await params

  return (
    <div className="space-y-6">
      <Suspense fallback={<TeamDetailSkeleton />}>
        <TeamDetailWrapper slug={slug} />
      </Suspense>
    </div>
  )
}

async function TeamDetailWrapper({ slug }: { slug: string }) {
  const teamResult = await getTeamBySlug(slug)

  if (!teamResult.isSuccess) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold">Team Not Found</h2>
          <p className="text-muted-foreground">
            The team you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
        </div>
      </div>
    )
  }

  const membersResult = await getTeamMembers(teamResult.data.id)

  if (!membersResult.isSuccess) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Failed to load team members</p>
      </div>
    )
  }

  return <TeamDetailContent team={teamResult.data} members={membersResult.data} />
}
