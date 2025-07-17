import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import { getDashboardSummary } from '@/lib/actions/db/leaderboard-actions'

import { DashboardSkeleton } from './_components/dashboard-skeleton'
import { ImprovedDashboardContent } from './_components/improved-dashboard-content'

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    return redirect('/login')
  }

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContentWrapper />
    </Suspense>
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

  return <ImprovedDashboardContent data={summaryResult.data} />
}
