import { auth } from '@clerk/nextjs/server'
import { BarChart3, Eye, Target, TrendingUp, Trophy, Users } from 'lucide-react'
import { redirect } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/components/ui/card'

export default async function AdminAnalyticsPage() {
  const { userId } = await auth()

  if (!userId) {
    return redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Riddles</CardTitle>
            <Target className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-muted-foreground text-xs">All time riddles created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-muted-foreground text-xs">Users active this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <Eye className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-muted-foreground text-xs">Riddle responses submitted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
            <Trophy className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-muted-foreground text-xs">Average correct rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Riddle Categories
            </CardTitle>
            <CardDescription>Distribution of riddles by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Logic</span>
                <span className="text-muted-foreground text-sm">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Math</span>
                <span className="text-muted-foreground text-sm">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Wordplay</span>
                <span className="text-muted-foreground text-sm">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Trivia</span>
                <span className="text-muted-foreground text-sm">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Visual</span>
                <span className="text-muted-foreground text-sm">0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Trends
            </CardTitle>
            <CardDescription>Recent activity and engagement metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Daily Active Users</span>
                <span className="text-muted-foreground text-sm">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Riddles Created Today</span>
                <span className="text-muted-foreground text-sm">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Responses Today</span>
                <span className="text-muted-foreground text-sm">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Teams Created</span>
                <span className="text-muted-foreground text-sm">0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>Enhanced analytics and reporting features</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Advanced analytics including detailed charts, user engagement metrics, performance
            analytics, and comprehensive reporting will be available in future updates.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
