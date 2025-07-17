'use server'

import { auth } from '@clerk/nextjs/server'
import { and, eq, sql } from 'drizzle-orm'

import { db } from '@/db/db'
import { profilesTable } from '@/db/schema/profiles'
import {
  InsertTeam,
  SelectTeam,
  SelectTeamJoinRequest,
  SelectTeamMembership,
  teamJoinRequestsTable,
  teamMembershipsTable,
  teamsTable,
} from '@/db/schema/teams'
import { ActionState } from '@/lib/types/server-action'

// Helper function to generate slug from team name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Team CRUD Operations
export async function createTeam(
  data: Omit<InsertTeam, 'slug' | 'ownerId'>,
): Promise<ActionState<SelectTeam>> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    const slug = generateSlug(data.name)

    // Check if slug already exists
    const existingTeam = await db.query.teams.findFirst({
      where: eq(teamsTable.slug, slug),
    })

    if (existingTeam) {
      return { isSuccess: false, message: 'Team name already exists' }
    }

    const [newTeam] = await db
      .insert(teamsTable)
      .values({
        ...data,
        slug,
        ownerId: userId,
      })
      .returning()

    // Automatically add creator as owner member
    await db.insert(teamMembershipsTable).values({
      teamId: newTeam.id,
      userId: userId,
      role: 'owner',
    })

    return {
      isSuccess: true,
      message: 'Team created successfully',
      data: newTeam,
    }
  } catch (error) {
    console.error('Error creating team:', error)
    return { isSuccess: false, message: 'Failed to create team' }
  }
}

export async function getTeamById(
  id: string,
): Promise<ActionState<SelectTeam & { memberCount: number }>> {
  try {
    const team = await db.query.teams.findFirst({
      where: eq(teamsTable.id, id),
    })

    if (!team) {
      return { isSuccess: false, message: 'Team not found' }
    }

    // Get member count
    const [memberCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(teamMembershipsTable)
      .where(eq(teamMembershipsTable.teamId, id))

    return {
      isSuccess: true,
      message: 'Team retrieved successfully',
      data: { ...team, memberCount: memberCount.count },
    }
  } catch (error) {
    console.error('Error getting team:', error)
    return { isSuccess: false, message: 'Failed to get team' }
  }
}

export async function getTeamBySlug(
  slug: string,
): Promise<ActionState<SelectTeam & { memberCount: number }>> {
  try {
    const team = await db.query.teams.findFirst({
      where: eq(teamsTable.slug, slug),
    })

    if (!team) {
      return { isSuccess: false, message: 'Team not found' }
    }

    // Get member count
    const [memberCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(teamMembershipsTable)
      .where(eq(teamMembershipsTable.teamId, team.id))

    return {
      isSuccess: true,
      message: 'Team retrieved successfully',
      data: { ...team, memberCount: memberCount.count },
    }
  } catch (error) {
    console.error('Error getting team:', error)
    return { isSuccess: false, message: 'Failed to get team' }
  }
}

export async function getPublicTeams(): Promise<
  ActionState<(SelectTeam & { memberCount: number })[]>
> {
  try {
    const teams = await db
      .select({
        id: teamsTable.id,
        name: teamsTable.name,
        slug: teamsTable.slug,
        description: teamsTable.description,
        isPublic: teamsTable.isPublic,
        ownerId: teamsTable.ownerId,
        maxMembers: teamsTable.maxMembers,
        createdAt: teamsTable.createdAt,
        updatedAt: teamsTable.updatedAt,
        memberCount: sql<number>`count(${teamMembershipsTable.id})`,
      })
      .from(teamsTable)
      .leftJoin(teamMembershipsTable, eq(teamsTable.id, teamMembershipsTable.teamId))
      .where(eq(teamsTable.isPublic, true))
      .groupBy(teamsTable.id)
      .orderBy(teamsTable.name)

    return {
      isSuccess: true,
      message: 'Public teams retrieved successfully',
      data: teams,
    }
  } catch (error) {
    console.error('Error getting public teams:', error)
    return { isSuccess: false, message: 'Failed to get public teams' }
  }
}

export async function getUserTeams(): Promise<
  ActionState<(SelectTeam & { memberCount: number; role: string })[]>
> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    const teams = await db
      .select({
        id: teamsTable.id,
        name: teamsTable.name,
        slug: teamsTable.slug,
        description: teamsTable.description,
        isPublic: teamsTable.isPublic,
        ownerId: teamsTable.ownerId,
        maxMembers: teamsTable.maxMembers,
        createdAt: teamsTable.createdAt,
        updatedAt: teamsTable.updatedAt,
        role: teamMembershipsTable.role,
        memberCount: sql<number>`count(${teamMembershipsTable.id}) OVER (PARTITION BY ${teamsTable.id})`,
      })
      .from(teamsTable)
      .innerJoin(teamMembershipsTable, eq(teamsTable.id, teamMembershipsTable.teamId))
      .where(eq(teamMembershipsTable.userId, userId))
      .orderBy(teamsTable.name)

    return {
      isSuccess: true,
      message: 'User teams retrieved successfully',
      data: teams,
    }
  } catch (error) {
    console.error('Error getting user teams:', error)
    return { isSuccess: false, message: 'Failed to get user teams' }
  }
}

export async function updateTeam(
  id: string,
  data: Partial<InsertTeam>,
): Promise<ActionState<SelectTeam>> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    // Check if user is team owner
    const membership = await db.query.teamMemberships.findFirst({
      where: and(
        eq(teamMembershipsTable.teamId, id),
        eq(teamMembershipsTable.userId, userId),
        eq(teamMembershipsTable.role, 'owner'),
      ),
    })

    if (!membership) {
      return { isSuccess: false, message: 'Only team owners can update team settings' }
    }

    const updateData = { ...data }

    // Generate new slug if name is being updated
    if (data.name) {
      updateData.slug = generateSlug(data.name)
    }

    const [updatedTeam] = await db
      .update(teamsTable)
      .set(updateData)
      .where(eq(teamsTable.id, id))
      .returning()

    return {
      isSuccess: true,
      message: 'Team updated successfully',
      data: updatedTeam,
    }
  } catch (error) {
    console.error('Error updating team:', error)
    return { isSuccess: false, message: 'Failed to update team' }
  }
}

export async function deleteTeam(id: string): Promise<ActionState<void>> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    // Check if user is team owner
    const team = await db.query.teams.findFirst({
      where: and(eq(teamsTable.id, id), eq(teamsTable.ownerId, userId)),
    })

    if (!team) {
      return { isSuccess: false, message: 'Only team owners can delete teams' }
    }

    await db.delete(teamsTable).where(eq(teamsTable.id, id))

    return {
      isSuccess: true,
      message: 'Team deleted successfully',
      data: undefined,
    }
  } catch (error) {
    console.error('Error deleting team:', error)
    return { isSuccess: false, message: 'Failed to delete team' }
  }
}

// Team Membership Operations
export async function getTeamMembers(
  teamId: string,
): Promise<ActionState<(SelectTeamMembership & { displayName: string | null })[]>> {
  try {
    const members = await db
      .select({
        id: teamMembershipsTable.id,
        teamId: teamMembershipsTable.teamId,
        userId: teamMembershipsTable.userId,
        role: teamMembershipsTable.role,
        joinedAt: teamMembershipsTable.joinedAt,
        createdAt: teamMembershipsTable.createdAt,
        displayName: profilesTable.displayName,
      })
      .from(teamMembershipsTable)
      .innerJoin(profilesTable, eq(teamMembershipsTable.userId, profilesTable.userId))
      .where(eq(teamMembershipsTable.teamId, teamId))
      .orderBy(teamMembershipsTable.joinedAt)

    return {
      isSuccess: true,
      message: 'Team members retrieved successfully',
      data: members,
    }
  } catch (error) {
    console.error('Error getting team members:', error)
    return { isSuccess: false, message: 'Failed to get team members' }
  }
}

export async function removeMemberFromTeam(
  teamId: string,
  userId: string,
): Promise<ActionState<void>> {
  try {
    const { userId: currentUserId } = await auth()

    if (!currentUserId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    // Check if current user is team owner
    const ownerMembership = await db.query.teamMemberships.findFirst({
      where: and(
        eq(teamMembershipsTable.teamId, teamId),
        eq(teamMembershipsTable.userId, currentUserId),
        eq(teamMembershipsTable.role, 'owner'),
      ),
    })

    if (!ownerMembership && currentUserId !== userId) {
      return { isSuccess: false, message: 'Only team owners can remove members' }
    }

    await db
      .delete(teamMembershipsTable)
      .where(and(eq(teamMembershipsTable.teamId, teamId), eq(teamMembershipsTable.userId, userId)))

    return {
      isSuccess: true,
      message: 'Member removed successfully',
      data: undefined,
    }
  } catch (error) {
    console.error('Error removing member:', error)
    return { isSuccess: false, message: 'Failed to remove member' }
  }
}

// Team Join Request Operations
export async function createJoinRequest(
  teamId: string,
): Promise<ActionState<SelectTeamJoinRequest>> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    // Check if user is already a member
    const existingMembership = await db.query.teamMemberships.findFirst({
      where: and(eq(teamMembershipsTable.teamId, teamId), eq(teamMembershipsTable.userId, userId)),
    })

    if (existingMembership) {
      return { isSuccess: false, message: 'You are already a member of this team' }
    }

    // Check if request already exists
    const existingRequest = await db.query.teamJoinRequests.findFirst({
      where: and(
        eq(teamJoinRequestsTable.teamId, teamId),
        eq(teamJoinRequestsTable.userId, userId),
      ),
    })

    if (existingRequest) {
      return { isSuccess: false, message: 'Join request already exists' }
    }

    const [newRequest] = await db
      .insert(teamJoinRequestsTable)
      .values({
        teamId,
        userId,
      })
      .returning()

    return {
      isSuccess: true,
      message: 'Join request created successfully',
      data: newRequest,
    }
  } catch (error) {
    console.error('Error creating join request:', error)
    return { isSuccess: false, message: 'Failed to create join request' }
  }
}

export async function getTeamJoinRequests(
  teamId: string,
): Promise<ActionState<(SelectTeamJoinRequest & { displayName: string | null })[]>> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    // Check if user is team owner
    const ownerMembership = await db.query.teamMemberships.findFirst({
      where: and(
        eq(teamMembershipsTable.teamId, teamId),
        eq(teamMembershipsTable.userId, userId),
        eq(teamMembershipsTable.role, 'owner'),
      ),
    })

    if (!ownerMembership) {
      return { isSuccess: false, message: 'Only team owners can view join requests' }
    }

    const requests = await db
      .select({
        id: teamJoinRequestsTable.id,
        teamId: teamJoinRequestsTable.teamId,
        userId: teamJoinRequestsTable.userId,
        status: teamJoinRequestsTable.status,
        requestedAt: teamJoinRequestsTable.requestedAt,
        reviewedAt: teamJoinRequestsTable.reviewedAt,
        reviewedBy: teamJoinRequestsTable.reviewedBy,
        createdAt: teamJoinRequestsTable.createdAt,
        updatedAt: teamJoinRequestsTable.updatedAt,
        displayName: profilesTable.displayName,
      })
      .from(teamJoinRequestsTable)
      .innerJoin(profilesTable, eq(teamJoinRequestsTable.userId, profilesTable.userId))
      .where(eq(teamJoinRequestsTable.teamId, teamId))
      .orderBy(teamJoinRequestsTable.requestedAt)

    return {
      isSuccess: true,
      message: 'Join requests retrieved successfully',
      data: requests,
    }
  } catch (error) {
    console.error('Error getting join requests:', error)
    return { isSuccess: false, message: 'Failed to get join requests' }
  }
}

export async function approveJoinRequest(requestId: string): Promise<ActionState<void>> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    const request = await db.query.teamJoinRequests.findFirst({
      where: eq(teamJoinRequestsTable.id, requestId),
    })

    if (!request) {
      return { isSuccess: false, message: 'Join request not found' }
    }

    // Check if user is team owner
    const ownerMembership = await db.query.teamMemberships.findFirst({
      where: and(
        eq(teamMembershipsTable.teamId, request.teamId),
        eq(teamMembershipsTable.userId, userId),
        eq(teamMembershipsTable.role, 'owner'),
      ),
    })

    if (!ownerMembership) {
      return { isSuccess: false, message: 'Only team owners can approve join requests' }
    }

    // Start transaction
    await db.transaction(async (tx) => {
      // Add user to team
      await tx.insert(teamMembershipsTable).values({
        teamId: request.teamId,
        userId: request.userId,
        role: 'member',
      })

      // Update request status
      await tx
        .update(teamJoinRequestsTable)
        .set({
          status: 'approved',
          reviewedAt: new Date(),
          reviewedBy: userId,
        })
        .where(eq(teamJoinRequestsTable.id, requestId))
    })

    return {
      isSuccess: true,
      message: 'Join request approved successfully',
      data: undefined,
    }
  } catch (error) {
    console.error('Error approving join request:', error)
    return { isSuccess: false, message: 'Failed to approve join request' }
  }
}

export async function rejectJoinRequest(requestId: string): Promise<ActionState<void>> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    const request = await db.query.teamJoinRequests.findFirst({
      where: eq(teamJoinRequestsTable.id, requestId),
    })

    if (!request) {
      return { isSuccess: false, message: 'Join request not found' }
    }

    // Check if user is team owner
    const ownerMembership = await db.query.teamMemberships.findFirst({
      where: and(
        eq(teamMembershipsTable.teamId, request.teamId),
        eq(teamMembershipsTable.userId, userId),
        eq(teamMembershipsTable.role, 'owner'),
      ),
    })

    if (!ownerMembership) {
      return { isSuccess: false, message: 'Only team owners can reject join requests' }
    }

    await db
      .update(teamJoinRequestsTable)
      .set({
        status: 'rejected',
        reviewedAt: new Date(),
        reviewedBy: userId,
      })
      .where(eq(teamJoinRequestsTable.id, requestId))

    return {
      isSuccess: true,
      message: 'Join request rejected successfully',
      data: undefined,
    }
  } catch (error) {
    console.error('Error rejecting join request:', error)
    return { isSuccess: false, message: 'Failed to reject join request' }
  }
}
