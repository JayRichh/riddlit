import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function LeaderboardTrendsPage() {
  const { userId } = await auth()

  if (!userId) {
    return redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Leaderboard Trends</h1>
      </div>

      <div className="grid gap-6">
        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-semibold">Coming Soon</h2>
          <p className="text-muted-foreground">
            Leaderboard trends and analytics will be available in a future update. This section will
            show historical rankings, performance trends, and statistical insights.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-medium">Weekly Trends</h3>
            <p className="text-muted-foreground text-sm">
              Track weekly ranking changes and performance patterns.
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-medium">Top Performers</h3>
            <p className="text-muted-foreground text-sm">
              Identify consistently high-performing players and teams.
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-medium">Activity Metrics</h3>
            <p className="text-muted-foreground text-sm">
              Analyze participation rates and engagement trends.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
