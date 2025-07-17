'use client'

import { AlertCircle, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { suggestRiddle } from '@/lib/actions/db/riddles-actions'
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

export function CreateRiddleForm() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [question, setQuestion] = useState('')
  const [category, setCategory] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [answerType, setAnswerType] = useState('')
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [multipleChoiceOptions, setMultipleChoiceOptions] = useState('')
  const [availableHours, setAvailableHours] = useState('24')
  const [imageUrl, setImageUrl] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

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

    const availableHoursNum = parseInt(availableHours)
    if (isNaN(availableHoursNum) || availableHoursNum <= 0) {
      setError('Available hours must be a positive number')
      return
    }

    // Parse multiple choice options if provided
    let mcOptions = null
    if (answerType === 'multiple_choice' && multipleChoiceOptions.trim()) {
      try {
        mcOptions = JSON.stringify(
          multipleChoiceOptions
            .split('\n')
            .map((opt) => opt.trim())
            .filter((opt) => opt),
        )
      } catch {
        setError('Invalid multiple choice options format')
        return
      }
    }

    const now = new Date()
    const availableFrom = now
    const availableUntil = new Date(now.getTime() + availableHoursNum * 60 * 60 * 1000)

    startTransition(async () => {
      const result = await suggestRiddle({
        title: title.trim(),
        description: description.trim() || null,
        question: question.trim(),
        category: category as 'logic' | 'math' | 'wordplay' | 'trivia' | 'visual',
        difficulty: difficulty as 'easy' | 'medium' | 'hard' | 'expert',
        answerType: answerType as 'text' | 'number' | 'boolean' | 'multiple_choice',
        correctAnswer: correctAnswer.trim(),
        multipleChoiceOptions: mcOptions,
        availableFrom,
        availableUntil,
        timezone: 'UTC',
        teamId: null, // Global riddle
        imageUrl: imageUrl || null,
      })

      if (result.isSuccess) {
        setSuccess('Riddle suggestion submitted successfully! It will be reviewed by moderators.')
        setTimeout(() => {
          router.push(`/riddles/${result.data.id}`)
        }, 2000)
      } else {
        setError(result.message)
      }
    })
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Suggest New Riddle</CardTitle>
        <CardDescription>
          Submit a new riddle for review. All riddles are reviewed by moderators before being
          published.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              <Select value={category} onValueChange={setCategory} disabled={isPending}>
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
              <Select value={difficulty} onValueChange={setDifficulty} disabled={isPending}>
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
            <Select value={answerType} onValueChange={setAnswerType} disabled={isPending}>
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

          <div className="space-y-2">
            <Label htmlFor="availableHours">Available for (hours)</Label>
            <Input
              id="availableHours"
              type="number"
              min="1"
              max="168"
              value={availableHours}
              onChange={(e) => setAvailableHours(e.target.value)}
              disabled={isPending}
            />
            <p className="text-muted-foreground text-sm">
              How long should this riddle be available for responses? (1-168 hours)
            </p>
          </div>

          <div className="space-y-2">
            <Label>Riddle Image (Optional)</Label>
            <ImageUpload value={imageUrl} onChange={setImageUrl} disabled={isPending} />
            <p className="text-muted-foreground text-sm">
              Add an image URL to make your riddle more engaging and visual.
            </p>
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
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Submitting...' : 'Submit Riddle'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
