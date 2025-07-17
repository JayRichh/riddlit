import { auth } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'

import { getRiddleBySlug } from '@/lib/actions/db/riddles-actions'

import { RiddleDetailContent } from '../_components/riddle-detail-content'
import { RiddleDetailSkeleton } from '../_components/riddle-detail-skeleton'

interface RiddleDetailPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function RiddleDetailPage({ params }: RiddleDetailPageProps) {
  const { userId } = await auth()

  if (!userId) {
    return redirect('/login')
  }

  const { slug } = await params

  return (
    <div className="space-y-6">
      <Suspense fallback={<RiddleDetailSkeleton />}>
        <RiddleDetailWrapper riddleSlug={slug} userId={userId} />
      </Suspense>
    </div>
  )
}

async function RiddleDetailWrapper({ riddleSlug, userId }: { riddleSlug: string; userId: string }) {
  const riddleResult = await getRiddleBySlug(riddleSlug)

  if (!riddleResult.isSuccess) {
    if (riddleResult.message?.includes('not found')) {
      notFound()
    }
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Failed to load riddle</p>
      </div>
    )
  }

  return <RiddleDetailContent riddle={riddleResult.data} userId={userId} />
}
