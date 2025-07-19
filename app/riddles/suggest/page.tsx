import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { CreateRiddleForm } from '../_components/create-riddle-form'

export const metadata = {
  title: 'Suggest Riddle | Riddlit',
  description: 'Submit a riddle suggestion for review by moderators',
}

export default async function SuggestRiddlePage() {
  const { userId } = await auth()

  if (!userId) {
    return redirect('/login')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Suggest New Riddle</h1>
        <p className="text-muted-foreground">
          Submit a riddle suggestion for review. All riddles are reviewed by moderators before being
          published.
        </p>
      </div>

      <CreateRiddleForm />
    </div>
  )
}
