'use client'

import { Award, Medal, Target, TrendingUp, Trophy, Zap } from 'lucide-react'

import { LeaderboardUser } from '@/lib/actions/db/leaderboard-actions'
import { Badge } from '@/lib/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/components/ui/card'

interface LeaderboardContentProps {
  leaderboard: LeaderboardUser[]
}

export function LeaderboardContent({ leaderboard }: LeaderboardContentProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-muted-foreground text-sm font-medium">#{rank}</span>
    }
  }

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Badge className="bg-yellow-500 text-white">1st</Badge>
      case 2:
        return <Badge className="bg-gray-400 text-white">2nd</Badge>
      case 3:
        return <Badge className="bg-amber-600 text-white">3rd</Badge>
      default:
        return <Badge variant="outline">#{rank}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="mb-8 grid grid-cols-3 gap-4">
          {leaderboard.slice(0, 3).map((entry, index) => (
            <Card
              key={entry.userId}
              className={`text-center ${index === 0 ? 'border-yellow-200 bg-yellow-50' : index === 1 ? 'border-gray-200 bg-gray-50' : 'border-amber-200 bg-amber-50'}`}
            >
              <CardHeader className="pb-3">
                <div className="mb-2 flex items-center justify-center">
                  {getRankIcon(entry.rank)}
                </div>
                <CardTitle className="text-lg">{entry.displayName || 'Anonymous'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-primary text-2xl font-bold">{entry.totalPoints}</div>
                <div className="text-muted-foreground text-sm">points</div>
                <div className="text-muted-foreground flex items-center justify-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    {entry.riddlesSolved} solved
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    {entry.currentStreak}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Full Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Individual Rankings
          </CardTitle>
          <CardDescription>Current standings based on total points earned</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboard.map((entry) => (
              <div
                key={entry.userId}
                className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex w-8 justify-center">{getRankIcon(entry.rank)}</div>
                  <div>
                    <div className="font-medium">{entry.displayName || 'Anonymous'}</div>
                    <div className="text-muted-foreground text-sm">
                      {entry.riddlesSolved} riddles solved • Streak: {entry.longestStreak}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-primary font-bold">{entry.totalPoints}</div>
                    <div className="text-muted-foreground text-xs">points</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{entry.riddlesSolved}</div>
                    <div className="text-muted-foreground text-xs">solved</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{entry.currentStreak}</div>
                    <div className="text-muted-foreground text-xs">streak</div>
                  </div>
                  {getRankBadge(entry.rank)}
                </div>
              </div>
            ))}
          </div>
          {leaderboard.length === 0 && (
            <div className="text-muted-foreground py-8 text-center">
              No leaderboard data available yet. Start solving riddles to appear here!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
