import { auth } from '@clerk/nextjs/server'
import { Target, Trophy, Users, Zap } from 'lucide-react'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import { getProfileByUserId } from '@/lib/actions/db/profiles'
import { Badge } from '@/lib/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/components/ui/card'

export default async function ProfilePage() {
  const { userId } = await auth()

  if (!userId) {
    return redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile Overview</h1>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <ProfileWrapper userId={userId} />
      </Suspense>
    </div>
  )
}

async function ProfileWrapper({ userId }: { userId: string }) {
  const profileResult = await getProfileByUserId(userId)

  if (!profileResult.isSuccess) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Failed to load profile</p>
      </div>
    )
  }

  const profile = profileResult.data

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Points</CardTitle>
          <Trophy className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{profile.totalPoints}</div>
          <p className="text-muted-foreground text-xs">Earned from riddles</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Riddles Solved</CardTitle>
          <Target className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{profile.riddlesSolved}</div>
          <p className="text-muted-foreground text-xs">Successfully completed</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          <Zap className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{profile.currentStreak}</div>
          <p className="text-muted-foreground text-xs">Best: {profile.longestStreak}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Membership</CardTitle>
          <Users className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <Badge variant={profile.membership === 'pro' ? 'default' : 'secondary'}>
              {profile.membership}
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs">Account type</p>
        </CardContent>
      </Card>
    </div>
  )
}
