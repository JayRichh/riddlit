import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { getTeamBySlug, getTeamMembers } from '@/lib/actions/db/teams-actions'

import { CreateTeamRiddleForm } from '../../../_components/create-team-riddle-form'

export const metadata = {
  title: 'Create Team Riddle | Riddlix',
  description: 'Create a new riddle for your team',
}

interface CreateTeamRiddlePageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function CreateTeamRiddlePage({ params }: CreateTeamRiddlePageProps) {
  const { userId } = await auth()

  if (!userId) {
    return redirect('/login')
  }

  const { slug } = await params

  const teamResult = await getTeamBySlug(slug)

  if (!teamResult.isSuccess) {
    return redirect('/teams')
  }

  const membersResult = await getTeamMembers(teamResult.data.id)

  if (!membersResult.isSuccess) {
    return redirect('/teams')
  }

  // Check if user is a member of this team
  const isMember = membersResult.data.some((member) => member.userId === userId)

  if (!isMember) {
    return redirect('/teams')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Team Riddle</h1>
        <p className="text-muted-foreground">
          Create a new riddle for your team &quot;{teamResult.data.name}&quot;. This riddle will be
          available immediately to team members.
        </p>
      </div>

      <CreateTeamRiddleForm teamId={teamResult.data.id} teamName={teamResult.data.name} />
    </div>
  )
}
