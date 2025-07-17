import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { CreateRiddleForm } from '../_components/create-riddle-form'

export default async function CreateRiddlePage() {
  const { userId } = await auth()

  if (!userId) {
    return redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Create New Riddle</h1>
      </div>

      <CreateRiddleForm />
    </div>
  )
}
