'use client'

import { AlertCircle, Check, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { approveRiddleRequest, rejectRiddleRequest } from '@/lib/actions/db/riddle-requests-actions'
import { Badge } from '@/lib/components/ui/badge'
import { Button } from '@/lib/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/components/ui/card'
import { ScrollArea } from '@/lib/components/ui/scroll-area'
import { Textarea } from '@/lib/components/ui/textarea'

interface RiddleRequestActionsProps {
  request: {
    id: string
    title: string
    description: string | null
    question: string
    category: string
    difficulty: string
    answerType: string
    correctAnswer: string
    multipleChoiceOptions: string | null
    imageUrl: string | null
    availableHours: number
    status: string
    requesterName: string | null
    requestedAt: Date
  }
}

export function RiddleRequestActions({ request }: RiddleRequestActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const router = useRouter()

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approveRiddleRequest(request.id)
      if (result.isSuccess) {
        router.refresh()
      }
    })
  }

  const handleReject = () => {
    if (!rejectionReason.trim()) return

    startTransition(async () => {
      const result = await rejectRiddleRequest(request.id, rejectionReason)
      if (result.isSuccess) {
        setShowRejectModal(false)
        setRejectionReason('')
        router.refresh()
      }
    })
  }

  const formatMultipleChoiceOptions = (options: string | null) => {
    if (!options) return []
    try {
      return JSON.parse(options)
    } catch {
      return []
    }
  }

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDetailsModal(true)}
          className="gap-2"
        >
          <AlertCircle className="h-4 w-4" />
          View Details
        </Button>

        <Button
          size="sm"
          variant="default"
          onClick={handleApprove}
          disabled={isPending}
          className="gap-2"
        >
          <Check className="h-4 w-4" />
          {isPending ? 'Approving...' : 'Approve'}
        </Button>

        <Button
          size="sm"
          variant="destructive"
          onClick={() => setShowRejectModal(true)}
          disabled={isPending}
          className="gap-2"
        >
          <X className="h-4 w-4" />
          Reject
        </Button>
      </div>

      {/* Details Modal */}
      {showDetailsModal && (
        <Card className="fixed inset-0 z-50 m-4 mx-auto my-8 max-h-[90vh] max-w-2xl overflow-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Riddle Request Details</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowDetailsModal(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-96 w-full">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Category</p>
                    <Badge variant="outline">{request.category}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Difficulty</p>
                    <Badge variant="secondary">{request.difficulty}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Answer Type</p>
                    <Badge variant="outline">{request.answerType}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Available Hours</p>
                    <p className="text-sm">{request.availableHours} hours</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium">Question</p>
                  <p className="text-muted-foreground text-sm">{request.question}</p>
                </div>

                {request.description && (
                  <div>
                    <p className="text-sm font-medium">Description</p>
                    <p className="text-muted-foreground text-sm">{request.description}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium">Correct Answer</p>
                  <p className="text-muted-foreground text-sm">{request.correctAnswer}</p>
                </div>

                {request.answerType === 'multiple_choice' && request.multipleChoiceOptions && (
                  <div>
                    <p className="text-sm font-medium">Multiple Choice Options</p>
                    <div className="space-y-1">
                      {formatMultipleChoiceOptions(request.multipleChoiceOptions).map(
                        (option: string, index: number) => (
                          <p key={index} className="text-muted-foreground text-sm">
                            • {option}
                          </p>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {request.imageUrl && (
                  <div>
                    <p className="text-sm font-medium">Image</p>
                    <img
                      src={request.imageUrl}
                      alt="Riddle"
                      className="mt-2 max-w-full rounded-md"
                    />
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Requested by</p>
                      <p className="text-muted-foreground">{request.requesterName || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="font-medium">Requested on</p>
                      <p className="text-muted-foreground">
                        {new Date(request.requestedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <Card className="fixed inset-0 z-50 m-4 mx-auto my-32 max-w-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Reject Riddle Request</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowRejectModal(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-muted-foreground text-sm">
                  Please provide a reason for rejecting this riddle request:
                </p>
              </div>
              <Textarea
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-20"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowRejectModal(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={isPending || !rejectionReason.trim()}
                >
                  {isPending ? 'Rejecting...' : 'Reject Request'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
