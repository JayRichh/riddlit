/*
<ai_context>
Main dashboard content component that displays user stats, global stats, recent activity, and top performers.
Uses data from the dashboard summary action.
</ai_context>
*/

'use client'

import { formatDistanceToNow } from 'date-fns'
import { Award, Clock, Target, Trophy, Users, Zap } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/lib/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/components/ui/card'

type DashboardData = {
  userStats: {
    totalPoints: number
    riddlesSolved: number
    currentStreak: number
    rank: number
  }
  globalStats: {
    totalUsers: number
    activeRiddles: number
    totalResponses: number
  }
  recentActivity: {
    userId: string
    displayName: string | null
    riddleTitle: string
    pointsEarned: number
    submittedAt: Date
  }[]
  topPerformers: {
    userId: string
    displayName: string | null
    totalPoints: number
  }[]
}

interface DashboardContentProps {
  data: DashboardData
}

export function DashboardContent({ data }: DashboardContentProps) {
  const { userStats, globalStats, recentActivity, topPerformers } = data

  return (
    <div className="space-y-6">
      {/* User Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Trophy className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalPoints}</div>
            <p className="text-muted-foreground text-xs">Rank #{userStats.rank}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Riddles Solved</CardTitle>
            <Target className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.riddlesSolved}</div>
            <p className="text-muted-foreground text-xs">Keep solving!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Zap className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.currentStreak}</div>
            <p className="text-muted-foreground text-xs">Days in a row</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Riddles</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.activeRiddles}</div>
            <p className="text-muted-foreground text-xs">
              <Link href="/riddles" className="text-primary hover:underline">
                View all
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Global Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Global Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold">{globalStats.totalUsers}</div>
              <p className="text-muted-foreground text-sm">Total Users</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{globalStats.activeRiddles}</div>
              <p className="text-muted-foreground text-sm">Active Riddles</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{globalStats.totalResponses}</div>
              <p className="text-muted-foreground text-sm">Total Responses</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <Link href="/leaderboard">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center">No recent activity yet</p>
              ) : (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                      <Trophy className="text-primary h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm leading-none font-medium">
                        {activity.displayName || 'Anonymous'} solved{' '}
                        <span className="text-primary">{activity.riddleTitle}</span>
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {formatDistanceToNow(new Date(activity.submittedAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="text-primary text-sm font-medium">+{activity.pointsEarned}</div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top Performers
            </CardTitle>
            <Link href="/leaderboard">
              <Button variant="outline" size="sm">
                Full Leaderboard
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center">No top performers yet</p>
              ) : (
                topPerformers.map((performer, index) => (
                  <div key={performer.userId} className="flex items-center space-x-3">
                    <div className="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm leading-none font-medium">
                        {performer.displayName || 'Anonymous'}
                      </p>
                    </div>
                    <div className="text-primary text-sm font-medium">
                      {performer.totalPoints} pts
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <Link href="/riddles">
              <Button variant="outline" className="w-full">
                Browse Riddles
              </Button>
            </Link>
            <Link href="/teams">
              <Button variant="outline" className="w-full">
                Join Teams
              </Button>
            </Link>
            <Link href="/riddles/suggest">
              <Button variant="outline" className="w-full">
                Suggest Riddle
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button variant="outline" className="w-full">
                View Leaderboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
