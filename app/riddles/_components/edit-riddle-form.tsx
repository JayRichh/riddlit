'use client'

import { AlertCircle, CheckCircle, Clock, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'

import { SelectRiddle } from '@/db/schema/riddles'
import { updateRiddle } from '@/lib/actions/db/riddles-actions'
import { Alert, AlertDescription } from '@/lib/components/ui/alert'
import { Button } from '@/lib/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/components/ui/card'
import { ImageUpload } from '@/lib/components/ui/image-upload'
import { Input } from '@/lib/components/ui/input'
import { Label } from '@/lib/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/lib/components/ui/select'
import { Textarea } from '@/lib/components/ui/textarea'

interface EditRiddleFormProps {
  riddle: SelectRiddle & { responseCount: number }
  onCancel: () => void
  onSuccess: () => void
}

export function EditRiddleForm({ riddle, onCancel, onSuccess }: EditRiddleFormProps) {
  const [title, setTitle] = useState(riddle.title)
  const [description, setDescription] = useState(riddle.description || '')
  const [question, setQuestion] = useState(riddle.question)
  const [category, setCategory] = useState(riddle.category)
  const [difficulty, setDifficulty] = useState(riddle.difficulty)
  const [answerType, setAnswerType] = useState(riddle.answerType)
  const [correctAnswer, setCorrectAnswer] = useState(riddle.correctAnswer)
  const [multipleChoiceOptions, setMultipleChoiceOptions] = useState(
    riddle.multipleChoiceOptions ? JSON.parse(riddle.multipleChoiceOptions).join('\n') : '',
  )
  const [imageUrl, setImageUrl] = useState(riddle.imageUrl || '')
  const [isImageUploading, setIsImageUploading] = useState(false)
  const [availableFrom, setAvailableFrom] = useState(
    new Date(riddle.availableFrom).toISOString().slice(0, 16),
  )
  const [availableUntil, setAvailableUntil] = useState(
    new Date(riddle.availableUntil).toISOString().slice(0, 16),
  )
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Prevent submission during image upload
    if (isImageUploading) {
      setError('Please wait for the image upload to complete')
      return
    }

    if (
      !title.trim() ||
      !question.trim() ||
      !category ||
      !difficulty ||
      !answerType ||
      !correctAnswer.trim()
    ) {
      setError('Please fill in all required fields')
      return
    }

    if (answerType === 'multiple_choice' && !multipleChoiceOptions.trim()) {
      setError('Please provide multiple choice options')
      return
    }

    // Validate dates
    const fromDate = new Date(availableFrom)
    const untilDate = new Date(availableUntil)
    if (fromDate >= untilDate) {
      setError('Available from date must be before available until date')
      return
    }

    // Parse multiple choice options if provided
    let mcOptions = null
    if (answerType === 'multiple_choice' && multipleChoiceOptions.trim()) {
      try {
        mcOptions = JSON.stringify(
          multipleChoiceOptions
            .split('\n')
            .map((opt: string) => opt.trim())
            .filter((opt: string) => opt),
        )
      } catch {
        setError('Invalid multiple choice options format')
        return
      }
    }

    startTransition(async () => {
      const result = await updateRiddle(riddle.id, {
        title: title.trim(),
        description: description.trim() || null,
        question: question.trim(),
        category: category as 'logic' | 'math' | 'wordplay' | 'trivia' | 'visual',
        difficulty: difficulty as 'easy' | 'medium' | 'hard' | 'expert',
        answerType: answerType as 'text' | 'number' | 'boolean' | 'multiple_choice',
        correctAnswer: correctAnswer.trim(),
        multipleChoiceOptions: mcOptions,
        availableFrom: fromDate,
        availableUntil: untilDate,
        imageUrl: imageUrl || null,
      })

      if (result.isSuccess) {
        setSuccess('Riddle updated successfully!')
        setTimeout(() => {
          onSuccess()
          router.refresh()
        }, 1500)
      } else {
        setError(result.message)
      }
    })
  }

  const handleQuickTimerAction = (action: 'extend24h' | 'resetNow' | 'extend1week') => {
    const now = new Date()
    const currentUntil = new Date(availableUntil)

    switch (action) {
      case 'extend24h':
        setAvailableUntil(
          new Date(currentUntil.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        )
        break
      case 'resetNow':
        setAvailableFrom(now.toISOString().slice(0, 16))
        setAvailableUntil(new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16))
        break
      case 'extend1week':
        setAvailableUntil(
          new Date(currentUntil.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        )
        break
    }
  }

  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Save className="h-5 w-5" />
          Edit Riddle
        </CardTitle>
        <CardDescription>
          Update riddle details, timers, and content. Changes will be applied immediately.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column - Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter riddle title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Optional description or context for the riddle"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isPending}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="question">Question *</Label>
                <Textarea
                  id="question"
                  placeholder="Enter the riddle question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  disabled={isPending}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={category}
                    onValueChange={(value) => setCategory(value as typeof category)}
                    disabled={isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="logic">Logic</SelectItem>
                      <SelectItem value="math">Math</SelectItem>
                      <SelectItem value="wordplay">Wordplay</SelectItem>
                      <SelectItem value="trivia">Trivia</SelectItem>
                      <SelectItem value="visual">Visual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty *</Label>
                  <Select
                    value={difficulty}
                    onValueChange={(value) => setDifficulty(value as typeof difficulty)}
                    disabled={isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy (10 points)</SelectItem>
                      <SelectItem value="medium">Medium (20 points)</SelectItem>
                      <SelectItem value="hard">Hard (30 points)</SelectItem>
                      <SelectItem value="expert">Expert (50 points)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="answerType">Answer Type *</Label>
                <Select
                  value={answerType}
                  onValueChange={(value) => setAnswerType(value as typeof answerType)}
                  disabled={isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select answer type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="boolean">True/False</SelectItem>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="correctAnswer">Correct Answer *</Label>
                <Input
                  id="correctAnswer"
                  placeholder={
                    answerType === 'boolean'
                      ? 'true or false'
                      : answerType === 'number'
                        ? 'Enter the correct number'
                        : 'Enter the correct answer'
                  }
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  disabled={isPending}
                />
              </div>

              {answerType === 'multiple_choice' && (
                <div className="space-y-2">
                  <Label htmlFor="multipleChoiceOptions">Multiple Choice Options *</Label>
                  <Textarea
                    id="multipleChoiceOptions"
                    placeholder="Enter each option on a new line"
                    value={multipleChoiceOptions}
                    onChange={(e) => setMultipleChoiceOptions(e.target.value)}
                    disabled={isPending}
                    rows={4}
                  />
                  <p className="text-muted-foreground text-sm">
                    Enter one option per line. The correct answer should match exactly one of these
                    options.
                  </p>
                </div>
              )}
            </div>

            {/* Right Column - Image & Timer */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Riddle Image (Optional)</Label>
                <ImageUpload
                  value={imageUrl}
                  onChange={setImageUrl}
                  disabled={isPending}
                  onUploadingChange={setIsImageUploading}
                />
                <p className="text-muted-foreground text-sm">
                  Upload a new image or keep the current one. Images are automatically compressed.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <Label className="text-base font-medium">Timer Management</Label>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickTimerAction('extend24h')}
                      disabled={isPending}
                    >
                      +24h
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickTimerAction('extend1week')}
                      disabled={isPending}
                    >
                      +1 Week
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickTimerAction('resetNow')}
                      disabled={isPending}
                    >
                      Reset to Now
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="availableFrom">Available From</Label>
                    <Input
                      id="availableFrom"
                      type="datetime-local"
                      value={availableFrom}
                      onChange={(e) => setAvailableFrom(e.target.value)}
                      disabled={isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="availableUntil">Available Until</Label>
                    <Input
                      id="availableUntil"
                      type="datetime-local"
                      value={availableUntil}
                      onChange={(e) => setAvailableUntil(e.target.value)}
                      disabled={isPending}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || isImageUploading}>
              {isPending ? 'Saving...' : isImageUploading ? 'Uploading Image...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
