'use client'

import { Clock, FileText, MessageCircle, Target, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

import { createRiddleRequest } from '@/lib/actions/db/riddle-requests-actions'
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

interface RiddleRequestFormProps {
  teamId: string
  teamName: string
  onSuccess?: () => void
}

export function RiddleRequestForm({ teamId, teamName, onSuccess }: RiddleRequestFormProps) {
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [question, setQuestion] = useState('')
  const [category, setCategory] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [answerType, setAnswerType] = useState('')
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [multipleChoiceOptions, setMultipleChoiceOptions] = useState(['', '', '', ''])
  const [availableHours, setAvailableHours] = useState('24')
  const [imageUrl, setImageUrl] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
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

    if (answerType === 'multiple_choice') {
      const validOptions = multipleChoiceOptions.filter((opt) => opt.trim())
      if (validOptions.length < 2) {
        setError('Please provide at least 2 multiple choice options')
        return
      }
    }

    const mcOptions =
      answerType === 'multiple_choice'
        ? JSON.stringify(multipleChoiceOptions.filter((opt) => opt.trim()))
        : null

    startTransition(async () => {
      const result = await createRiddleRequest({
        teamId,
        title: title.trim(),
        description: description.trim() || null,
        question: question.trim(),
        category: category as 'logic' | 'math' | 'wordplay' | 'trivia' | 'visual',
        difficulty: difficulty as 'easy' | 'medium' | 'hard' | 'expert',
        answerType: answerType as 'text' | 'number' | 'boolean' | 'multiple_choice',
        correctAnswer: correctAnswer.trim(),
        multipleChoiceOptions: mcOptions,
        imageUrl: imageUrl || null,
        availableHours: parseInt(availableHours),
      })

      if (result.isSuccess) {
        setSuccess('Riddle request submitted successfully! The team owner will review it.')
        toast.success('Riddle request submitted successfully!')

        // Reset form
        setTitle('')
        setDescription('')
        setQuestion('')
        setCategory('')
        setDifficulty('')
        setAnswerType('')
        setCorrectAnswer('')
        setMultipleChoiceOptions(['', '', '', ''])
        setAvailableHours('24')
        setImageUrl('')

        onSuccess?.()
      } else {
        setError(result.message)
        toast.error(result.message)
      }
    })
  }

  const handleMultipleChoiceChange = (index: number, value: string) => {
    const newOptions = [...multipleChoiceOptions]
    newOptions[index] = value
    setMultipleChoiceOptions(newOptions)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Request a Riddle for "{teamName}"
        </CardTitle>
        <CardDescription>
          Submit a riddle request for this team. The team owner will review and decide whether to
          approve it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 rounded-md p-3">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a catchy title for your riddle"
              disabled={isPending}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional: Add context or background information"
              disabled={isPending}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="question">
              Question <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What is the riddle question?"
              disabled={isPending}
              required
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select value={category} onValueChange={setCategory} disabled={isPending} required>
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
              <Label htmlFor="difficulty">
                Difficulty <span className="text-destructive">*</span>
              </Label>
              <Select
                value={difficulty}
                onValueChange={setDifficulty}
                disabled={isPending}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="answerType">
              Answer Type <span className="text-destructive">*</span>
            </Label>
            <Select value={answerType} onValueChange={setAnswerType} disabled={isPending} required>
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

          {answerType === 'multiple_choice' && (
            <div className="space-y-2">
              <Label>Multiple Choice Options</Label>
              <div className="space-y-2">
                {multipleChoiceOptions.map((option, index) => (
                  <Input
                    key={index}
                    value={option}
                    onChange={(e) => handleMultipleChoiceChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    disabled={isPending}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="correctAnswer">
              Correct Answer <span className="text-destructive">*</span>
            </Label>
            <Input
              id="correctAnswer"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              placeholder="What is the correct answer?"
              disabled={isPending}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="availableHours">
              Available Hours <span className="text-destructive">*</span>
            </Label>
            <Select value={availableHours} onValueChange={setAvailableHours} disabled={isPending}>
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 hour</SelectItem>
                <SelectItem value="6">6 hours</SelectItem>
                <SelectItem value="12">12 hours</SelectItem>
                <SelectItem value="24">24 hours</SelectItem>
                <SelectItem value="48">48 hours</SelectItem>
                <SelectItem value="72">72 hours</SelectItem>
                <SelectItem value="168">1 week</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Image (Optional)</Label>
            <ImageUpload value={imageUrl} onChange={setImageUrl} disabled={isPending} />
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Submitting Request...' : 'Submit Riddle Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
