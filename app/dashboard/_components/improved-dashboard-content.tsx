'use client'

import { formatDistanceToNow } from 'date-fns'
import { Activity, Award, Clock, Target, TrendingUp, Trophy, Zap } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/lib/components/ui/badge'
import { Button } from '@/lib/components/ui/button'

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
    riddleSlug: string
    pointsEarned: number
    submittedAt: Date
  }[]
  topPerformers: {
    userId: string
    displayName: string | null
    totalPoints: number
  }[]
}

interface ImprovedDashboardContentProps {
  data: DashboardData
}

export function ImprovedDashboardContent({ data }: ImprovedDashboardContentProps) {
  const { userStats, globalStats, recentActivity, topPerformers } = data

  const StatCard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    href,
  }: {
    icon: React.ComponentType<{ className?: string }>
    title: string
    value: string | number
    subtitle: string
    href?: string
  }) => (
    <div className="group relative">
      <div className="from-primary/20 to-primary/10 absolute -inset-0.5 rounded-2xl bg-gradient-to-r opacity-0 blur transition duration-300 group-hover:opacity-100"></div>
      <div className="bg-background/80 border-border/40 hover:border-primary/30 hover:shadow-primary/5 relative rounded-xl border p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <Icon className="text-primary/80 h-5 w-5" />
          <Badge variant="secondary" className="text-xs">
            {title}
          </Badge>
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-bold tracking-tight">{value}</div>
          <p className="text-muted-foreground text-sm">
            {href ? (
              <Link href={href} className="hover:text-primary transition-colors">
                {subtitle}
              </Link>
            ) : (
              subtitle
            )}
          </p>
        </div>
      </div>
    </div>
  )

  const ActivityItem = ({ activity }: { activity: (typeof recentActivity)[0] }) => (
    <div className="group hover:bg-muted/50 flex items-center gap-3 rounded-lg p-3 transition-colors">
      <div className="relative">
        <div className="from-primary/20 to-primary/10 absolute -inset-1 rounded-full bg-gradient-to-r opacity-0 blur transition duration-300 group-hover:opacity-100"></div>
        <div className="bg-primary/10 relative flex h-8 w-8 items-center justify-center rounded-full">
          <Trophy className="text-primary h-4 w-4" />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm leading-none font-medium">
          <span className="text-muted-foreground">{activity.displayName || 'Anonymous'}</span>{' '}
          solved{' '}
          <Link
            href={`/riddles/${activity.riddleSlug}`}
            className="text-primary font-semibold hover:underline"
          >
            {activity.riddleTitle}
          </Link>
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          {formatDistanceToNow(new Date(activity.submittedAt), { addSuffix: true })}
        </p>
      </div>
      <div className="text-primary text-sm font-semibold">+{activity.pointsEarned}</div>
    </div>
  )

  const PerformerItem = ({
    performer,
    index,
  }: {
    performer: (typeof topPerformers)[0]
    index: number
  }) => (
    <div className="group hover:bg-muted/50 flex items-center gap-3 rounded-lg p-3 transition-colors">
      <div className="relative">
        <div className="from-primary/20 to-primary/10 absolute -inset-1 rounded-full bg-gradient-to-r opacity-0 blur transition duration-300 group-hover:opacity-100"></div>
        <div className="bg-primary/10 text-primary relative flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold">
          {index + 1}
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm leading-none font-medium">
          {performer.displayName || 'Anonymous'}
        </p>
      </div>
      <div className="text-primary text-sm font-semibold">{performer.totalPoints} pts</div>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* User Stats */}
      {/* Quick Actions */}
      <div className="space-y-4">
        {/* <h2 className="text-lg font-semibold">Quick Actions</h2> */}
        <div className="grid gap-3 md:grid-cols-4">
          <Link href="/riddles" className="group">
            <Button
              variant="outline"
              className="group-hover:border-primary/50 w-full transition-colors"
            >
              Browse Riddles
            </Button>
          </Link>
          <Link href="/teams" className="group">
            <Button
              variant="outline"
              className="group-hover:border-primary/50 w-full transition-colors"
            >
              Join Teams
            </Button>
          </Link>
          <Link href="/riddles/suggest" className="group">
            <Button
              variant="outline"
              className="group-hover:border-primary/50 w-full transition-colors"
            >
              Suggest Riddle
            </Button>
          </Link>
          <Link href="/leaderboard" className="group">
            <Button
              variant="outline"
              className="group-hover:border-primary/50 w-full transition-colors"
            >
              View Leaderboard
            </Button>
          </Link>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Trophy}
          title="Total Points"
          value={userStats.totalPoints}
          subtitle={`Rank #${userStats.rank}`}
        />
        <StatCard
          icon={Target}
          title="Riddles Solved"
          value={userStats.riddlesSolved}
          subtitle="Keep solving!"
        />
        <StatCard
          icon={Zap}
          title="Current Streak"
          value={userStats.currentStreak}
          subtitle="Days in a row"
        />
        <StatCard
          icon={Clock}
          title="Active Riddles"
          value={globalStats.activeRiddles}
          subtitle="View all"
          href="/riddles"
        />
      </div>

      {/* Global Stats */}
      <div className="relative">
        <div className="from-primary/10 to-primary/5 absolute -inset-0.5 rounded-2xl bg-gradient-to-r opacity-50 blur"></div>
        <div className="bg-background/60 border-border/40 relative rounded-xl border p-6 backdrop-blur-sm">
          <div className="mb-6 flex items-center gap-2">
            <TrendingUp className="text-primary h-5 w-5" />
            <h2 className="text-lg font-semibold">Global Stats</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2 text-center">
              <div className="text-primary text-3xl font-bold">{globalStats.totalUsers}</div>
              <p className="text-muted-foreground text-sm">Total Users</p>
            </div>
            <div className="space-y-2 text-center">
              <div className="text-primary text-3xl font-bold">{globalStats.activeRiddles}</div>
              <p className="text-muted-foreground text-sm">Active Riddles</p>
            </div>
            <div className="space-y-2 text-center">
              <div className="text-primary text-3xl font-bold">{globalStats.totalResponses}</div>
              <p className="text-muted-foreground text-sm">Total Responses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="text-primary h-5 w-5" />
              <h2 className="text-lg font-semibold">Recent Activity</h2>
            </div>
            <Link href="/leaderboard">
              <Button variant="ghost" size="sm" className="text-xs">
                View All →
              </Button>
            </Link>
          </div>
          <div className="space-y-1">
            {recentActivity.length === 0 ? (
              <div className="py-12 text-center">
                <Activity className="text-muted-foreground/50 mx-auto mb-4 h-12 w-12" />
                <p className="text-muted-foreground">No recent activity yet</p>
              </div>
            ) : (
              recentActivity.map((activity, index) => (
                <ActivityItem key={index} activity={activity} />
              ))
            )}
          </div>
        </div>

        {/* Top Performers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="text-primary h-5 w-5" />
              <h2 className="text-lg font-semibold">Top Performers</h2>
            </div>
            <Link href="/leaderboard">
              <Button variant="ghost" size="sm" className="text-xs">
                Full Leaderboard →
              </Button>
            </Link>
          </div>
          <div className="space-y-1">
            {topPerformers.length === 0 ? (
              <div className="py-12 text-center">
                <Award className="text-muted-foreground/50 mx-auto mb-4 h-12 w-12" />
                <p className="text-muted-foreground">No top performers yet</p>
              </div>
            ) : (
              topPerformers.map((performer, index) => (
                <PerformerItem key={performer.userId} performer={performer} index={index} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
