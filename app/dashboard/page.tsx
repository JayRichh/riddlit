import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import { getDashboardSummary } from '@/lib/actions/db/leaderboard-actions'

import { DashboardContent } from './_components/dashboard-content'
import { DashboardSkeleton } from './_components/dashboard-skeleton'

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    return redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContentWrapper />
      </Suspense>
    </div>
  )
}

async function DashboardContentWrapper() {
  const summaryResult = await getDashboardSummary()

  if (!summaryResult.isSuccess) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Failed to load dashboard data</p>
      </div>
    )
  }

  return <DashboardContent data={summaryResult.data} />
}
