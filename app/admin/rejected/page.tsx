import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import { SelectRiddle } from '@/db/schema/riddles'
import { getRejectedRiddles } from '@/lib/actions/db/riddles-actions'
import { Badge } from '@/lib/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/components/ui/card'

export default async function AdminRejectedPage() {
  const { userId } = await auth()

  if (!userId) {
    return redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Rejected Riddles</h1>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <RejectedRiddlesWrapper />
      </Suspense>
    </div>
  )
}

async function RejectedRiddlesWrapper() {
  const riddlesResult = await getRejectedRiddles()

  if (!riddlesResult.isSuccess) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Failed to load rejected riddles</p>
      </div>
    )
  }

  if (riddlesResult.data.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">No rejected riddles found</p>
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
              <Badge variant="destructive">Rejected</Badge>
            </div>
            <CardTitle className="line-clamp-2 text-lg">{riddle.title}</CardTitle>
            <CardDescription className="line-clamp-3">
              {riddle.description || riddle.question}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-muted-foreground flex items-center justify-between text-sm">
              <span>Difficulty: {riddle.difficulty}</span>
              <span>{riddle.basePoints} points</span>
            </div>
            {riddle.rejectionReason && (
              <div className="text-sm">
                <span className="font-medium text-red-600">Rejection Reason:</span>
                <p className="text-muted-foreground mt-1">{riddle.rejectionReason}</p>
              </div>
            )}
            <div className="text-muted-foreground text-sm">
              Created: {new Date(riddle.createdAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
