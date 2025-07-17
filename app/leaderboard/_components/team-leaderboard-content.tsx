'use client'

import { TrendingUp, Trophy, Users } from 'lucide-react'

import { Badge } from '@/lib/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/components/ui/card'

interface TeamLeaderboardEntry {
  teamId: string
  name: string
  totalPoints: number
  memberCount: number
  avgPointsPerMember: number
  rank: number
}

interface TeamLeaderboardContentProps {
  leaderboard: TeamLeaderboardEntry[]
}

export function TeamLeaderboardContent({ leaderboard }: TeamLeaderboardContentProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />
      case 3:
        return <Trophy className="h-5 w-5 text-amber-600" />
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Team Rankings
          </CardTitle>
          <CardDescription>Current standings based on total team points</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboard.map((entry) => (
              <div
                key={entry.teamId}
                className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex w-8 justify-center">{getRankIcon(entry.rank)}</div>
                  <div>
                    <div className="font-medium">{entry.name}</div>
                    <div className="text-muted-foreground flex items-center gap-1 text-sm">
                      <Users className="h-3 w-3" />
                      {entry.memberCount} members
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-primary font-bold">{entry.totalPoints}</div>
                    <div className="text-muted-foreground text-xs">total points</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{entry.avgPointsPerMember}</div>
                    <div className="text-muted-foreground text-xs">avg per member</div>
                  </div>
                  {getRankBadge(entry.rank)}
                </div>
              </div>
            ))}
          </div>
          {leaderboard.length === 0 && (
            <div className="text-muted-foreground py-8 text-center">
              No team data available yet. Create teams and start solving riddles!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
