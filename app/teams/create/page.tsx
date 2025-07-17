import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { CreateTeamForm } from '../_components/create-team-form'

export const metadata = {
  title: 'Create Team | Riddlix',
  description: 'Create a new team on Riddlix',
}

export default async function CreateTeamPage() {
  const { userId } = await auth()

  if (!userId) {
    return redirect('/login')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Team</h1>
        <p className="text-muted-foreground">
          Create a new team to collaborate on riddles with other members.
        </p>
      </div>

      <CreateTeamForm />
    </div>
  )
}
