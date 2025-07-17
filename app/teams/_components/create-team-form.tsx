/*
<ai_context>
Form component for creating a new team.
Handles team creation with validation and error handling.
</ai_context>
*/

'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { createTeam } from '@/lib/actions/db/teams-actions'
import { Button } from '@/lib/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/components/ui/card'
import { Checkbox } from '@/lib/components/ui/checkbox'
import { Input } from '@/lib/components/ui/input'
import { Label } from '@/lib/components/ui/label'
import { Textarea } from '@/lib/components/ui/textarea'

export function CreateTeamForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false,
    maxMembers: 50,
  })

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Team name is required')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createTeam({
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        isPublic: formData.isPublic,
        maxMembers: formData.maxMembers,
      })

      if (result.isSuccess) {
        toast.success('Team created successfully!')
        router.push(`/teams/${result.data.slug}`)
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error('Failed to create team')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Team Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter team name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your team's purpose and goals"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxMembers">Maximum Members</Label>
            <Input
              id="maxMembers"
              type="number"
              min="1"
              max="100"
              value={formData.maxMembers}
              onChange={(e) => handleInputChange('maxMembers', parseInt(e.target.value) || 50)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPublic"
              checked={formData.isPublic}
              onCheckedChange={(checked) => handleInputChange('isPublic', checked as boolean)}
            />
            <Label
              htmlFor="isPublic"
              className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Make this team public
            </Label>
          </div>
          <p className="text-muted-foreground text-sm">
            Public teams can be discovered and joined by anyone. Private teams require an invitation
            or join request.
          </p>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating...
                </>
              ) : (
                'Create Team'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
