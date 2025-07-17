'use client'

import { useTransition } from 'react'

import { approveRiddle, rejectRiddle } from '@/lib/actions/db/riddles-actions'
import { Button } from '@/lib/components/ui/button'

interface AdminActionsProps {
  riddleId: string
  onSuccess: () => void
}

export function AdminActions({ riddleId, onSuccess }: AdminActionsProps) {
  const [isPending, startTransition] = useTransition()

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approveRiddle(riddleId)
      if (result.isSuccess) {
        onSuccess()
      }
    })
  }

  const handleReject = () => {
    startTransition(async () => {
      const result = await rejectRiddle(riddleId, 'Rejected by admin')
      if (result.isSuccess) {
        onSuccess()
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
