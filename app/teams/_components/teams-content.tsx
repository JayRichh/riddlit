/*
<ai_context>
Main teams content component that displays user teams and public teams.
Allows users to browse, join, and manage teams.
</ai_context>
*/

'use client'

import { Crown, Globe, Lock, UserPlus, Users } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

import { createJoinRequest } from '@/lib/actions/db/teams-actions'
import { Badge } from '@/lib/components/ui/badge'
import { Button } from '@/lib/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/components/ui/card'

type UserTeam = {
  id: string
  name: string
  slug: string
  description: string | null
  isPublic: boolean
  ownerId: string
  maxMembers: number
  createdAt: Date
  updatedAt: Date
  role: string
  memberCount: number
}

type PublicTeam = {
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

interface TeamsContentProps {
  userTeams: UserTeam[]
  publicTeams: PublicTeam[]
}

export function TeamsContent({ userTeams, publicTeams }: TeamsContentProps) {
  const [joiningTeams, setJoiningTeams] = useState<Set<string>>(new Set())

  const handleJoinTeam = async (teamId: string) => {
    setJoiningTeams((prev) => new Set(prev).add(teamId))

    try {
      const result = await createJoinRequest(teamId)

      if (result.isSuccess) {
        toast.success('Join request sent successfully!')
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error('Failed to send join request')
    } finally {
      setJoiningTeams((prev) => {
        const newSet = new Set(prev)
        newSet.delete(teamId)
        return newSet
      })
    }
  }

  const isUserInTeam = (teamId: string) => {
    return userTeams.some((team) => team.id === teamId)
  }

  return (
    <div className="space-y-8">
      {/* My Teams Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">My Teams</h2>
          <Link href="/teams/create">
            <Button>Create Team</Button>
          </Link>
        </div>

        {userTeams.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="text-muted-foreground mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-semibold">No teams yet</h3>
              <p className="text-muted-foreground mb-4 text-center">
                You haven&apos;t joined any teams yet. Create your own team or join an existing one!
              </p>
              <Link href="/teams/create">
                <Button>Create Your First Team</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {userTeams.map((team) => (
              <Card key={team.id} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      <Link
                        href={`/teams/${team.slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        {team.name}
                      </Link>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {team.role === 'owner' && <Crown className="h-4 w-4 text-yellow-500" />}
                      {team.isPublic ? (
                        <Globe className="h-4 w-4 text-green-500" />
                      ) : (
                        <Lock className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {team.description || 'No description provided'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="text-muted-foreground h-4 w-4" />
                      <span className="text-muted-foreground text-sm">
                        {team.memberCount} / {team.maxMembers} members
                      </span>
                    </div>
                    <Badge variant={team.role === 'owner' ? 'default' : 'secondary'}>
                      {team.role}
                    </Badge>
                  </div>
                  <Link href={`/teams/${team.slug}`}>
                    <Button variant="outline" className="w-full">
                      View Team
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Public Teams Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Public Teams</h2>

        {publicTeams.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Globe className="text-muted-foreground mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-semibold">No public teams</h3>
              <p className="text-muted-foreground text-center">
                There are no public teams available to join at the moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {publicTeams.map((team) => {
              const isAlreadyMember = isUserInTeam(team.id)
              const isJoining = joiningTeams.has(team.id)
              const isFull = team.memberCount >= team.maxMembers

              return (
                <Card key={team.id} className="transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        <Link
                          href={`/teams/${team.slug}`}
                          className="hover:text-primary transition-colors"
                        >
                          {team.name}
                        </Link>
                      </CardTitle>
                      <Globe className="h-4 w-4 text-green-500" />
                    </div>
                    <CardDescription className="line-clamp-2">
                      {team.description || 'No description provided'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="text-muted-foreground h-4 w-4" />
                        <span className="text-muted-foreground text-sm">
                          {team.memberCount} / {team.maxMembers} members
                        </span>
                      </div>
                      {isFull && <Badge variant="destructive">Full</Badge>}
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/teams/${team.slug}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          View Team
                        </Button>
                      </Link>
                      {!isAlreadyMember && !isFull && (
                        <Button
                          onClick={() => handleJoinTeam(team.id)}
                          disabled={isJoining}
                          className="gap-2"
                        >
                          {isJoining ? (
                            <>
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              Joining...
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4" />
                              Join
                            </>
                          )}
                        </Button>
                      )}
                      {isAlreadyMember && <Badge variant="secondary">Member</Badge>}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
