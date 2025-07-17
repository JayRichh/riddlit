/*
<ai_context>
Team detail content component that displays team information, members, and management options.
Handles team member management, join requests, and team settings.
</ai_context>
*/

'use client'

import { useUser } from '@clerk/nextjs'
import { formatDistanceToNow } from 'date-fns'
import { Crown, Globe, Lock, Settings, UserCheck, UserMinus, Users, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

import {
  approveJoinRequest,
  getTeamJoinRequests,
  rejectJoinRequest,
  removeMemberFromTeam,
} from '@/lib/actions/db/teams-actions'
import { Badge } from '@/lib/components/ui/badge'
import { Button } from '@/lib/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/components/ui/card'

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

interface TeamDetailContentProps {
  team: Team
  members: Member[]
}

export function TeamDetailContent({ team, members }: TeamDetailContentProps) {
  const { user } = useUser()
  const [joinRequests, setJoinRequests] = useState<
    Array<{
      id: string
      displayName: string | null
      requestedAt: Date
    }>
  >([])
  const [showJoinRequests, setShowJoinRequests] = useState(false)
  const [loadingRequests, setLoadingRequests] = useState(false)

  const currentUserMembership = members.find((member) => member.userId === user?.id)
  const isOwner = currentUserMembership?.role === 'owner'
  const isMember = !!currentUserMembership

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    try {
      const result = await removeMemberFromTeam(team.id, userId)
      if (result.isSuccess) {
        toast.success('Member removed successfully')
        // In a real app, you'd refresh the data here
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
      {/* Team Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{team.name}</h1>
              <div className="flex items-center gap-2">
                {team.isPublic ? (
                  <Globe className="h-5 w-5 text-green-500" />
                ) : (
                  <Lock className="h-5 w-5 text-gray-500" />
                )}
                <Badge variant={team.isPublic ? 'default' : 'secondary'}>
                  {team.isPublic ? 'Public' : 'Private'}
                </Badge>
              </div>
            </div>
            <p className="text-muted-foreground mt-2">
              {team.description || 'No description provided'}
            </p>
          </div>
          {isOwner && (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={loadJoinRequests} disabled={loadingRequests}>
                {loadingRequests ? 'Loading...' : 'Join Requests'}
              </Button>
              <Link href={`/teams/${team.slug}/settings`}>
                <Button variant="outline" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div className="text-muted-foreground flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>
              {team.memberCount} / {team.maxMembers} members
            </span>
          </div>
          <div>Created {formatDistanceToNow(new Date(team.createdAt), { addSuffix: true })}</div>
          {currentUserMembership && (
            <div>
              You joined{' '}
              {formatDistanceToNow(new Date(currentUserMembership.joinedAt), { addSuffix: true })}
            </div>
          )}
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{team.memberCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Team Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((team.memberCount / team.maxMembers) * 100)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Riddles Solved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      {/* Join Requests Modal */}
      {showJoinRequests && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Join Requests</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowJoinRequests(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {joinRequests.length === 0 ? (
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
            )}
          </CardContent>
        </Card>
      )}

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
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
                      onClick={() => handleRemoveMember(member.userId)}
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

      {/* Quick Actions */}
      {isMember && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Link href={`/teams/${team.slug}/riddles/create`}>
                <Button className="w-full">Create Team Riddle</Button>
              </Link>
              <Link href={`/riddles?team=${team.id}`}>
                <Button variant="outline" className="w-full">
                  View Team Riddles
                </Button>
              </Link>
              <Link href={`/leaderboard?team=${team.id}`}>
                <Button variant="outline" className="w-full">
                  Team Leaderboard
                </Button>
              </Link>
              <Button variant="outline" className="w-full">
                Team Stats
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
