import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { RiddleRequestForm } from '@/app/teams/_components/riddle-request-form'
import { getTeamBySlug, getTeamMembers } from '@/lib/actions/db/teams-actions'

interface RiddleRequestPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function RiddleRequestPage({ params }: RiddleRequestPageProps) {
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

  // Check if user is already a member of this team
  const isMember = membersResult.data.some((member) => member.userId === userId)

  if (isMember) {
    return redirect(`/teams/${slug}/riddles/create`)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Request a Riddle</h1>
        <p className="text-muted-foreground">
          Submit a riddle request for team "{teamResult.data.name}". The team owner will review and
          decide whether to approve it.
        </p>
      </div>

      <RiddleRequestForm
        teamId={teamResult.data.id}
        teamName={teamResult.data.name}
        onSuccess={() => {
          // Redirect to team page after successful submission
          window.location.href = `/teams/${slug}`
        }}
      />
    </div>
  )
}
