'use client'

import { AlertCircle, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { updateTeam } from '@/lib/actions/db/teams-actions'
import { Alert, AlertDescription } from '@/lib/components/ui/alert'
import { Button } from '@/lib/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/components/ui/card'
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

type Team = {
  id: string
  name: string
  slug: string
  description: string | null
  isPublic: boolean
  ownerId: string
  maxMembers: number
  createdAt: Date
  updatedAt: Date
  memberCount: number
}

interface TeamSettingsFormProps {
  team: Team
}

export function TeamSettingsForm({ team }: TeamSettingsFormProps) {
  const [name, setName] = useState(team.name)
  const [description, setDescription] = useState(team.description || '')
  const [isPublic, setIsPublic] = useState(team.isPublic.toString())
  const [maxMembers, setMaxMembers] = useState(team.maxMembers.toString())
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!name.trim()) {
      setError('Team name is required')
      return
    }

    const maxMembersNum = parseInt(maxMembers)
    if (isNaN(maxMembersNum) || maxMembersNum < 1 || maxMembersNum > 500) {
      setError('Max members must be between 1 and 500')
      return
    }

    if (maxMembersNum < team.memberCount) {
      setError(`Max members cannot be less than current member count (${team.memberCount})`)
      return
    }

    startTransition(async () => {
      const result = await updateTeam(team.id, {
        name: name.trim(),
        description: description.trim() || null,
        isPublic: isPublic === 'true',
        maxMembers: maxMembersNum,
      })

      if (result.isSuccess) {
        setSuccess('Team settings updated successfully!')
        setTimeout(() => {
          router.push(`/teams/${result.data.slug}`)
        }, 2000)
      } else {
        setError(result.message)
      }
    })
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Team Settings</CardTitle>
        <CardDescription>
          Update your team settings. Changes will be visible to all team members.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Team Name *</Label>
            <Input
              id="name"
              placeholder="Enter team name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional team description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="isPublic">Team Visibility</Label>
              <Select value={isPublic} onValueChange={setIsPublic} disabled={isPending}>
                <SelectTrigger>
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Public - Anyone can find and join</SelectItem>
                  <SelectItem value="false">Private - Invite only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxMembers">Max Members</Label>
              <Input
                id="maxMembers"
                type="number"
                min="1"
                max="500"
                value={maxMembers}
                onChange={(e) => setMaxMembers(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <h4 className="mb-2 font-medium">Current Team Info</h4>
            <div className="text-muted-foreground space-y-1 text-sm">
              <p>Current members: {team.memberCount}</p>
              <p>Team slug: {team.slug}</p>
              <p>Created: {new Date(team.createdAt).toLocaleDateString()}</p>
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
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
