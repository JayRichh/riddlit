import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { getTeamBySlug, getTeamMembers } from '@/lib/actions/db/teams-actions'

import { TeamSettingsForm } from '../../_components/team-settings-form'

export const metadata = {
  title: 'Team Settings | Riddlit',
  description: 'Update team settings and preferences',
}

interface TeamSettingsPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function TeamSettingsPage({ params }: TeamSettingsPageProps) {
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

  // Check if user is the owner of this team
  const isOwner = membersResult.data.some(
    (member) => member.userId === userId && member.role === 'owner',
  )

  if (!isOwner) {
    return redirect(`/teams/${slug}`)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Team Settings</h1>
        <p className="text-muted-foreground">
          Update settings for &quot;{teamResult.data.name}&quot;. Changes will be visible to all
          team members.
        </p>
      </div>

      <TeamSettingsForm team={teamResult.data} />
    </div>
  )
}
