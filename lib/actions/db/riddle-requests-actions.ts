'use server'

import { auth } from '@clerk/nextjs/server'
import { and, eq } from 'drizzle-orm'

import { db } from '@/db/db'
import { profilesTable } from '@/db/schema/profiles'
import {
  InsertRiddleRequest,
  riddleRequestsTable,
  SelectRiddleRequest,
} from '@/db/schema/riddle-requests'
import { teamMembershipsTable, teamsTable } from '@/db/schema/teams'
import { createTeamNotification } from '@/lib/actions/db/notification-actions'
import { createRiddle } from '@/lib/actions/db/riddles-actions'
import { ActionState } from '@/lib/types/server-action'

// Create riddle request
export async function createRiddleRequest(
  data: Omit<InsertRiddleRequest, 'requesterId' | 'status' | 'requestedAt'>,
): Promise<ActionState<SelectRiddleRequest>> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    // Check if user is already a member of the team
    const membership = await db.query.teamMemberships.findFirst({
      where: and(
        eq(teamMembershipsTable.teamId, data.teamId),
        eq(teamMembershipsTable.userId, userId),
      ),
    })

    if (membership) {
      return { isSuccess: false, message: 'Team members can create riddles directly' }
    }

    // Check if team exists
    const team = await db.query.teams.findFirst({
      where: eq(teamsTable.id, data.teamId),
    })

    if (!team) {
      return { isSuccess: false, message: 'Team not found' }
    }

    // Check if user already has a pending request for this team
    const existingRequest = await db.query.riddleRequests.findFirst({
      where: and(
        eq(riddleRequestsTable.teamId, data.teamId),
        eq(riddleRequestsTable.requesterId, userId),
        eq(riddleRequestsTable.status, 'pending'),
      ),
    })

    if (existingRequest) {
      return {
        isSuccess: false,
        message: 'You already have a pending riddle request for this team',
      }
    }

    const [newRequest] = await db
      .insert(riddleRequestsTable)
      .values({
        ...data,
        requesterId: userId,
      })
      .returning()

    // Notify team owner about the request
    await createTeamNotification(team.ownerId, 'riddle_request', team.name, {
      teamId: team.id,
      teamSlug: team.slug,
      requesterId: userId,
      riddleTitle: data.title,
    })

    return {
      isSuccess: true,
      message: 'Riddle request submitted successfully',
      data: newRequest,
    }
  } catch (error) {
    console.error('Error creating riddle request:', error)
    return { isSuccess: false, message: 'Failed to create riddle request' }
  }
}

// Get riddle requests for a team
export async function getTeamRiddleRequests(
  teamId: string,
): Promise<ActionState<(SelectRiddleRequest & { requesterName: string | null })[]>> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    // Check if user is team owner
    const team = await db.query.teams.findFirst({
      where: and(eq(teamsTable.id, teamId), eq(teamsTable.ownerId, userId)),
    })

    if (!team) {
      return { isSuccess: false, message: 'Only team owners can view riddle requests' }
    }

    const requests = await db
      .select({
        id: riddleRequestsTable.id,
        teamId: riddleRequestsTable.teamId,
        requesterId: riddleRequestsTable.requesterId,
        title: riddleRequestsTable.title,
        description: riddleRequestsTable.description,
        question: riddleRequestsTable.question,
        category: riddleRequestsTable.category,
        difficulty: riddleRequestsTable.difficulty,
        answerType: riddleRequestsTable.answerType,
        correctAnswer: riddleRequestsTable.correctAnswer,
        multipleChoiceOptions: riddleRequestsTable.multipleChoiceOptions,
        imageUrl: riddleRequestsTable.imageUrl,
        availableHours: riddleRequestsTable.availableHours,
        status: riddleRequestsTable.status,
        requestedAt: riddleRequestsTable.requestedAt,
        reviewedAt: riddleRequestsTable.reviewedAt,
        reviewedBy: riddleRequestsTable.reviewedBy,
        rejectionReason: riddleRequestsTable.rejectionReason,
        createdAt: riddleRequestsTable.createdAt,
        updatedAt: riddleRequestsTable.updatedAt,
        requesterName: profilesTable.displayName,
      })
      .from(riddleRequestsTable)
      .innerJoin(profilesTable, eq(riddleRequestsTable.requesterId, profilesTable.userId))
      .where(eq(riddleRequestsTable.teamId, teamId))
      .orderBy(riddleRequestsTable.requestedAt)

    return {
      isSuccess: true,
      message: 'Riddle requests retrieved successfully',
      data: requests,
    }
  } catch (error) {
    console.error('Error getting riddle requests:', error)
    return { isSuccess: false, message: 'Failed to get riddle requests' }
  }
}

// Approve riddle request
export async function approveRiddleRequest(requestId: string): Promise<ActionState<void>> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    const request = await db.query.riddleRequests.findFirst({
      where: eq(riddleRequestsTable.id, requestId),
    })

    if (!request) {
      return { isSuccess: false, message: 'Riddle request not found' }
    }

    // Check if user is team owner
    const team = await db.query.teams.findFirst({
      where: and(eq(teamsTable.id, request.teamId), eq(teamsTable.ownerId, userId)),
    })

    if (!team) {
      return { isSuccess: false, message: 'Only team owners can approve riddle requests' }
    }

    // Create the actual riddle
    const now = new Date()
    const availableFrom = now
    const availableUntil = new Date(now.getTime() + request.availableHours * 60 * 60 * 1000)

    const riddleResult = await createRiddle({
      title: request.title,
      description: request.description,
      question: request.question,
      category: request.category,
      difficulty: request.difficulty,
      answerType: request.answerType,
      correctAnswer: request.correctAnswer,
      multipleChoiceOptions: request.multipleChoiceOptions,
      imageUrl: request.imageUrl,
      availableFrom,
      availableUntil,
      timezone: 'UTC',
      teamId: request.teamId,
      status: 'active',
    })

    if (!riddleResult.isSuccess) {
      return { isSuccess: false, message: 'Failed to create riddle: ' + riddleResult.message }
    }

    // Update request status
    await db
      .update(riddleRequestsTable)
      .set({
        status: 'approved',
        reviewedAt: now,
        reviewedBy: userId,
      })
      .where(eq(riddleRequestsTable.id, requestId))

    // Notify the requester
    await createTeamNotification(request.requesterId, 'riddle_request_approved', team.name, {
      teamId: team.id,
      teamSlug: team.slug,
      riddleTitle: request.title,
      riddleSlug: riddleResult.data.slug,
    })

    return {
      isSuccess: true,
      message: 'Riddle request approved and riddle created successfully',
      data: undefined,
    }
  } catch (error) {
    console.error('Error approving riddle request:', error)
    return { isSuccess: false, message: 'Failed to approve riddle request' }
  }
}

// Reject riddle request
export async function rejectRiddleRequest(
  requestId: string,
  reason: string,
): Promise<ActionState<void>> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    const request = await db.query.riddleRequests.findFirst({
      where: eq(riddleRequestsTable.id, requestId),
    })

    if (!request) {
      return { isSuccess: false, message: 'Riddle request not found' }
    }

    // Check if user is team owner
    const team = await db.query.teams.findFirst({
      where: and(eq(teamsTable.id, request.teamId), eq(teamsTable.ownerId, userId)),
    })

    if (!team) {
      return { isSuccess: false, message: 'Only team owners can reject riddle requests' }
    }

    // Update request status
    await db
      .update(riddleRequestsTable)
      .set({
        status: 'rejected',
        reviewedAt: new Date(),
        reviewedBy: userId,
        rejectionReason: reason,
      })
      .where(eq(riddleRequestsTable.id, requestId))

    // Notify the requester
    await createTeamNotification(request.requesterId, 'riddle_request_rejected', team.name, {
      teamId: team.id,
      teamSlug: team.slug,
      riddleTitle: request.title,
      reason,
    })

    return {
      isSuccess: true,
      message: 'Riddle request rejected successfully',
      data: undefined,
    }
  } catch (error) {
    console.error('Error rejecting riddle request:', error)
    return { isSuccess: false, message: 'Failed to reject riddle request' }
  }
}

// Get user's riddle requests
export async function getUserRiddleRequests(): Promise<
  ActionState<(SelectRiddleRequest & { teamName: string })[]>
> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    const requests = await db
      .select({
        id: riddleRequestsTable.id,
        teamId: riddleRequestsTable.teamId,
        requesterId: riddleRequestsTable.requesterId,
        title: riddleRequestsTable.title,
        description: riddleRequestsTable.description,
        question: riddleRequestsTable.question,
        category: riddleRequestsTable.category,
        difficulty: riddleRequestsTable.difficulty,
        answerType: riddleRequestsTable.answerType,
        correctAnswer: riddleRequestsTable.correctAnswer,
        multipleChoiceOptions: riddleRequestsTable.multipleChoiceOptions,
        imageUrl: riddleRequestsTable.imageUrl,
        availableHours: riddleRequestsTable.availableHours,
        status: riddleRequestsTable.status,
        requestedAt: riddleRequestsTable.requestedAt,
        reviewedAt: riddleRequestsTable.reviewedAt,
        reviewedBy: riddleRequestsTable.reviewedBy,
        rejectionReason: riddleRequestsTable.rejectionReason,
        createdAt: riddleRequestsTable.createdAt,
        updatedAt: riddleRequestsTable.updatedAt,
        teamName: teamsTable.name,
      })
      .from(riddleRequestsTable)
      .innerJoin(teamsTable, eq(riddleRequestsTable.teamId, teamsTable.id))
      .where(eq(riddleRequestsTable.requesterId, userId))
      .orderBy(riddleRequestsTable.requestedAt)

    return {
      isSuccess: true,
      message: 'User riddle requests retrieved successfully',
      data: requests,
    }
  } catch (error) {
    console.error('Error getting user riddle requests:', error)
    return { isSuccess: false, message: 'Failed to get user riddle requests' }
  }
}
