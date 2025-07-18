'use client'

import { useUser } from '@clerk/nextjs'
import { formatDistanceToNow } from 'date-fns'
import { AlertCircle, Calendar, CheckCircle, Clock, Edit, Trophy, Users } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { SelectRiddle } from '@/db/schema/riddles'
import { submitResponse } from '@/lib/actions/db/riddles-actions'
import { Badge } from '@/lib/components/ui/badge'
import { Button } from '@/lib/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/components/ui/card'
import { Label } from '@/lib/components/ui/label'
import { Textarea } from '@/lib/components/ui/textarea'

import { EditRiddleForm } from './edit-riddle-form'

interface RiddleDetailContentProps {
  riddle: SelectRiddle & { responseCount: number }
  userId: string
}

export function RiddleDetailContent({ riddle, userId }: RiddleDetailContentProps) {
  const { user } = useUser()
  const [response, setResponse] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()

  // Check if user can edit this riddle
  const canEdit = user?.id === riddle.createdBy || user?.publicMetadata?.membership === 'pro'

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'hard':
        return 'bg-red-100 text-red-800'
      case 'expert':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTimeRemaining = () => {
    const now = new Date()
    const expires = new Date(riddle.availableUntil)
    const remaining = expires.getTime() - now.getTime()

    if (remaining <= 0) return 'Expired'

    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const isExpired = () => {
    return new Date(riddle.availableUntil) < new Date()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!response.trim()) {
      setError('Please enter a response')
      return
    }

    startTransition(async () => {
      const result = await submitResponse(riddle.id, response.trim())

      if (result.isSuccess) {
        setSuccess('Response submitted successfully!')
        setResponse('')
        router.refresh()
      } else {
        setError(result.message)
      }
    })
  }

  if (isEditing) {
    return (
      <EditRiddleForm
        riddle={riddle}
        onCancel={() => setIsEditing(false)}
        onSuccess={() => {
          setIsEditing(false)
          router.refresh()
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{riddle.title}</h1>
          {canEdit && (
            <Button variant="outline" onClick={() => setIsEditing(true)} className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Riddle
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getDifficultyColor(riddle.difficulty)}>{riddle.difficulty}</Badge>
          <Badge variant="outline">{riddle.category}</Badge>
          <Badge variant="outline" className="text-orange-600">
            <Trophy className="mr-1 h-3 w-3" />
            {riddle.basePoints} points
          </Badge>
        </div>
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column - Riddle details */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Question
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{riddle.question}</p>
              {riddle.description && (
                <div className="mt-4 border-t pt-4">
                  <p className="text-muted-foreground text-sm">{riddle.description}</p>
                </div>
              )}
              {riddle.imageUrl && (
                <div className="mt-4 border-t pt-4">
                  <div className="relative mx-auto aspect-video w-full max-w-lg">
                    <Image
                      src={riddle.imageUrl}
                      alt="Riddle image"
                      fill
                      className="rounded-md object-cover"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Answer Type</Label>
                  <div className="text-muted-foreground flex items-center gap-1 text-sm">
                    <span className="capitalize">{riddle.answerType.replace('_', ' ')}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Time Remaining</Label>
                  <div className="text-muted-foreground flex items-center gap-1 text-sm">
                    <Clock className="h-4 w-4" />
                    {getTimeRemaining()}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-sm font-medium">Available From</Label>
                <div className="text-muted-foreground flex items-center gap-1 text-sm">
                  <Calendar className="h-4 w-4" />
                  {formatDistanceToNow(new Date(riddle.availableFrom), { addSuffix: true })}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-sm font-medium">Available Until</Label>
                <div className="text-muted-foreground flex items-center gap-1 text-sm">
                  <Calendar className="h-4 w-4" />
                  {formatDistanceToNow(new Date(riddle.availableUntil), { addSuffix: true })}
                </div>
              </div>
            </CardContent>
          </Card>

          {riddle.answerType === 'multiple_choice' && riddle.multipleChoiceOptions && (
            <Card>
              <CardHeader>
                <CardTitle>Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {JSON.parse(riddle.multipleChoiceOptions).map((option: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {String.fromCharCode(65 + index)})
                      </span>
                      <span className="text-sm">{option}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column - Response form */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Submit Your Response</CardTitle>
              <CardDescription>
                {isExpired() ? 'This riddle has expired.' : 'Share your answer to this riddle.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="response">Your Answer</Label>
                  <Textarea
                    id="response"
                    placeholder={
                      riddle.answerType === 'boolean'
                        ? 'Enter true or false'
                        : riddle.answerType === 'number'
                          ? 'Enter a number'
                          : riddle.answerType === 'multiple_choice'
                            ? 'Enter the letter of your choice (A, B, C, etc.)'
                            : 'Enter your answer here...'
                    }
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    disabled={isPending || isExpired()}
                    rows={4}
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    {success}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isPending || isExpired()}>
                  {isPending ? 'Submitting...' : 'Submit Response'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Response stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Response Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-4 text-center">
            <div className="text-2xl font-bold">{riddle.responseCount}</div>
            <div className="text-muted-foreground text-sm">Total Responses</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
