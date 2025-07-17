'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

import { approveRiddle, rejectRiddle } from '@/lib/actions/db/riddles-actions'
import { Button } from '@/lib/components/ui/button'

interface AdminActionsProps {
  riddleId: string
}

export function AdminActions({ riddleId }: AdminActionsProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approveRiddle(riddleId)
      if (result.isSuccess) {
        router.refresh()
      }
    })
  }

  const handleReject = () => {
    startTransition(async () => {
      const result = await rejectRiddle(riddleId, 'Rejected by admin')
      if (result.isSuccess) {
        router.refresh()
      }
    })
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="default" onClick={handleApprove} disabled={isPending}>
        {isPending ? 'Processing...' : 'Approve'}
      </Button>
      <Button size="sm" variant="outline" onClick={handleReject} disabled={isPending}>
        {isPending ? 'Processing...' : 'Reject'}
      </Button>
    </div>
  )
}
