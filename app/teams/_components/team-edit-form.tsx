'use client'

import { useUser } from '@clerk/nextjs'
import { formatDistanceToNow } from 'date-fns'
import {
  AlertCircle,
  CheckCircle,
  Crown,
  Globe,
  Lock,
  Save,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

import {
  approveJoinRequest,
  getTeamJoinRequests,
  rejectJoinRequest,
  removeMemberFromTeam,
  updateTeam,
} from '@/lib/actions/db/teams-actions'
import { Alert, AlertDescription } from '@/lib/components/ui/alert'
import { Badge } from '@/lib/components/ui/badge'
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
import { Switch } from '@/lib/components/ui/switch'
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

type Member = {
  id: string
  teamId: string
  userId: string
  role: string
  joinedAt: Date
  createdAt: Date
  displayName: string | null
}

interface TeamEditFormProps {
  team: Team
  members: Member[]
  onCancel: () => void
  onSuccess: () => void
}

export function TeamEditForm({ team, members, onCancel, onSuccess }: TeamEditFormProps) {
  const { user } = useUser()
  const [name, setName] = useState(team.name)
  const [description, setDescription] = useState(team.description || '')
  const [isPublic, setIsPublic] = useState(team.isPublic)
  const [maxMembers, setMaxMembers] = useState(team.maxMembers.toString())
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [joinRequests, setJoinRequests] = useState<
    Array<{
      id: string
      displayName: string | null
      requestedAt: Date
    }>
  >([])
  const [showJoinRequests, setShowJoinRequests] = useState(false)
  const [loadingRequests, setLoadingRequests] = useState(false)
  const router = useRouter()

  const isOwner = user?.id === team.ownerId
  const currentUserMembership = members.find((member) => member.userId === user?.id)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!name.trim()) {
      setError('Team name is required')
      return
    }

    const maxMembersNum = parseInt(maxMembers)
    if (isNaN(maxMembersNum) || maxMembersNum < 1 || maxMembersNum > 1000) {
      setError('Max members must be between 1 and 1000')
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
        isPublic,
        maxMembers: maxMembersNum,
      })

      if (result.isSuccess) {
        setSuccess('Team updated successfully!')
        setTimeout(() => {
          onSuccess()
          router.refresh()
        }, 1500)
      } else {
        setError(result.message)
      }
    })
  }

  const handleRemoveMember = async (userId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from the team?`)) return

    try {
      const result = await removeMemberFromTeam(team.id, userId)
      if (result.isSuccess) {
        toast.success('Member removed successfully')
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error('Failed to remove member')
    }
  }

  const loadJoinRequests = async () => {
    setLoadingRequests(true)
    try {
      const result = await getTeamJoinRequests(team.id)
      if (result.isSuccess) {
        setJoinRequests(result.data)
        setShowJoinRequests(true)
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error('Failed to load join requests')
    } finally {
      setLoadingRequests(false)
    }
  }

  const handleApproveRequest = async (requestId: string) => {
    try {
      const result = await approveJoinRequest(requestId)
      if (result.isSuccess) {
        toast.success('Join request approved')
        setJoinRequests((prev) => prev.filter((req) => req.id !== requestId))
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error('Failed to approve request')
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    try {
      const result = await rejectJoinRequest(requestId)
      if (result.isSuccess) {
        toast.success('Join request rejected')
        setJoinRequests((prev) => prev.filter((req) => req.id !== requestId))
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error('Failed to reject request')
    }
  }

  return (
    <div className="space-y-6">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Edit Team Settings
          </CardTitle>
          <CardDescription>
            Update team information and settings. Changes will be applied immediately.
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
                placeholder="Enter team description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isPending}
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="isPublic">Team Visibility</Label>
                  <p className="text-muted-foreground text-sm">
                    {isPublic
                      ? 'Public teams can be discovered and joined by anyone'
                      : 'Private teams require an invitation to join'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="isPublic"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                    disabled={isPending}
                  />
                  <div className="flex items-center gap-1">
                    {isPublic ? (
                      <Globe className="h-4 w-4 text-green-500" />
                    ) : (
                      <Lock className="h-4 w-4 text-gray-500" />
                    )}
                    <span className="text-sm font-medium">{isPublic ? 'Public' : 'Private'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxMembers">Maximum Members</Label>
                <Input
                  id="maxMembers"
                  type="number"
                  min="1"
                  max="1000"
                  value={maxMembers}
                  onChange={(e) => setMaxMembers(e.target.value)}
                  disabled={isPending}
                />
                <p className="text-muted-foreground text-sm">Current members: {team.memberCount}</p>
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
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Join Requests Management */}
      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Join Requests
              </span>
              <Button variant="outline" onClick={loadJoinRequests} disabled={loadingRequests}>
                {loadingRequests ? 'Loading...' : 'Load Requests'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showJoinRequests ? (
              joinRequests.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center">No pending join requests</p>
              ) : (
                <div className="space-y-3">
                  {joinRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{request.displayName || 'Anonymous'}</p>
                        <p className="text-muted-foreground text-sm">
                          Requested{' '}
                          {formatDistanceToNow(new Date(request.requestedAt), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveRequest(request.id)}
                          className="gap-2"
                        >
                          <UserCheck className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectRequest(request.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <p className="text-muted-foreground py-8 text-center">
                Click "Load Requests" to view pending join requests
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Member Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Member Management
          </CardTitle>
          <CardDescription>Manage team members and their roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                    <span className="text-sm font-medium">
                      {member.displayName?.charAt(0) || 'A'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{member.displayName || 'Anonymous'}</p>
                    <p className="text-muted-foreground text-sm">
                      Joined {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                    {member.role === 'owner' && <Crown className="mr-1 h-3 w-3" />}
                    {member.role}
                  </Badge>
                  {isOwner && member.role !== 'owner' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleRemoveMember(member.userId, member.displayName || 'Anonymous')
                      }
                      className="gap-2"
                    >
                      <UserMinus className="h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
