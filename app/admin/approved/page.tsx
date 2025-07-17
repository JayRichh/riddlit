import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import { SelectRiddle } from '@/db/schema/riddles'
import { getApprovedRiddles } from '@/lib/actions/db/riddles-actions'
import { Badge } from '@/lib/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/components/ui/card'

export default async function AdminApprovedPage() {
  const { userId } = await auth()

  if (!userId) {
    return redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Approved Riddles</h1>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <ApprovedRiddlesWrapper />
      </Suspense>
    </div>
  )
}

async function ApprovedRiddlesWrapper() {
  const riddlesResult = await getApprovedRiddles()

  if (!riddlesResult.isSuccess) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Failed to load approved riddles</p>
      </div>
    )
  }

  if (riddlesResult.data.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">No approved riddles found</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {riddlesResult.data.map((riddle: SelectRiddle & { responseCount: number }) => (
        <Card key={riddle.id} className="transition-shadow hover:shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline">{riddle.category}</Badge>
              <Badge variant="secondary">{riddle.difficulty}</Badge>
            </div>
            <CardTitle className="line-clamp-2 text-lg">{riddle.title}</CardTitle>
            <CardDescription className="line-clamp-3">
              {riddle.description || riddle.question}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-muted-foreground flex items-center justify-between text-sm">
              <span>Status: Approved</span>
              <span>{riddle.basePoints} points</span>
            </div>
            <div className="text-muted-foreground text-sm">
              Created: {new Date(riddle.createdAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
