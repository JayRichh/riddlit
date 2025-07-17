'use server'

import { auth } from '@clerk/nextjs/server'
import { and, eq, gte, lte, sql } from 'drizzle-orm'

import { db } from '@/db/db'
import { profilesTable } from '@/db/schema/profiles'
import {
  InsertRiddle,
  riddleResponsesTable,
  riddlesTable,
  SelectRiddle,
  SelectRiddleResponse,
} from '@/db/schema/riddles'
import { teamMembershipsTable } from '@/db/schema/teams'
import { ActionState } from '@/lib/types/server-action'

// Helper function to generate slug from riddle title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Helper function to validate answer based on type
function validateAnswer(answer: string, correctAnswer: string, answerType: string): boolean {
  switch (answerType) {
    case 'text':
      return answer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()
    case 'number':
      return parseFloat(answer) === parseFloat(correctAnswer)
    case 'boolean':
      return answer.toLowerCase() === correctAnswer.toLowerCase()
    case 'multiple_choice':
      return answer === correctAnswer
    default:
      return false
  }
}

// Helper function to calculate points based on difficulty
function calculatePoints(difficulty: string): number {
  switch (difficulty) {
    case 'easy':
      return 10
    case 'medium':
      return 20
    case 'hard':
      return 30
    case 'expert':
      return 50
    default:
      return 10
  }
}

// Riddle CRUD Operations
export async function createRiddle(
  data: Omit<InsertRiddle, 'slug' | 'createdBy' | 'basePoints'>,
): Promise<ActionState<SelectRiddle>> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    const slug = generateSlug(data.title)
    const basePoints = calculatePoints(data.difficulty)

    // Check if slug already exists
    const existingRiddle = await db.query.riddles.findFirst({
      where: eq(riddlesTable.slug, slug),
    })

    if (existingRiddle) {
      return { isSuccess: false, message: 'Riddle title already exists' }
    }

    const [newRiddle] = await db
      .insert(riddlesTable)
      .values({
        ...data,
        slug,
        createdBy: userId,
        basePoints,
      })
      .returning()

    return {
      isSuccess: true,
      message: 'Riddle created successfully',
      data: newRiddle,
    }
  } catch (error) {
    console.error('Error creating riddle:', error)
    return { isSuccess: false, message: 'Failed to create riddle' }
  }
}

export async function suggestRiddle(
  data: Omit<InsertRiddle, 'slug' | 'createdBy' | 'suggestedBy' | 'basePoints' | 'status'>,
): Promise<ActionState<SelectRiddle>> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    const slug = generateSlug(data.title)
    const basePoints = calculatePoints(data.difficulty)

    // Check if slug already exists
    const existingRiddle = await db.query.riddles.findFirst({
      where: eq(riddlesTable.slug, slug),
    })

    if (existingRiddle) {
      return { isSuccess: false, message: 'Riddle title already exists' }
    }

    const [newRiddle] = await db
      .insert(riddlesTable)
      .values({
        ...data,
        slug,
        createdBy: userId,
        suggestedBy: userId,
        basePoints,
        status: 'suggested',
      })
      .returning()

    return {
      isSuccess: true,
      message: 'Riddle suggestion submitted successfully',
      data: newRiddle,
    }
  } catch (error) {
    console.error('Error suggesting riddle:', error)
    return { isSuccess: false, message: 'Failed to suggest riddle' }
  }
}

export async function getRiddleById(
  id: string,
): Promise<ActionState<SelectRiddle & { responseCount: number }>> {
  try {
    const riddle = await db.query.riddles.findFirst({
      where: eq(riddlesTable.id, id),
    })

    if (!riddle) {
      return { isSuccess: false, message: 'Riddle not found' }
    }

    // Get response count
    const [responseCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(riddleResponsesTable)
      .where(eq(riddleResponsesTable.riddleId, id))

    return {
      isSuccess: true,
      message: 'Riddle retrieved successfully',
      data: { ...riddle, responseCount: responseCount.count },
    }
  } catch (error) {
    console.error('Error getting riddle:', error)
    return { isSuccess: false, message: 'Failed to get riddle' }
  }
}

export async function getRiddleBySlug(
  slug: string,
): Promise<ActionState<SelectRiddle & { responseCount: number }>> {
  try {
    const riddle = await db.query.riddles.findFirst({
      where: eq(riddlesTable.slug, slug),
    })

    if (!riddle) {
      return { isSuccess: false, message: 'Riddle not found' }
    }

    // Get response count
    const [responseCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(riddleResponsesTable)
      .where(eq(riddleResponsesTable.riddleId, riddle.id))

    return {
      isSuccess: true,
      message: 'Riddle retrieved successfully',
      data: { ...riddle, responseCount: responseCount.count },
    }
  } catch (error) {
    console.error('Error getting riddle:', error)
    return { isSuccess: false, message: 'Failed to get riddle' }
  }
}

export async function getActiveRiddles(
  teamId?: string,
): Promise<ActionState<(SelectRiddle & { responseCount: number })[]>> {
  try {
    const now = new Date()

    const riddles = await db
      .select({
        id: riddlesTable.id,
        title: riddlesTable.title,
        slug: riddlesTable.slug,
        description: riddlesTable.description,
        question: riddlesTable.question,
        imageUrl: riddlesTable.imageUrl,
        answerType: riddlesTable.answerType,
        correctAnswer: riddlesTable.correctAnswer,
        multipleChoiceOptions: riddlesTable.multipleChoiceOptions,
        category: riddlesTable.category,
        difficulty: riddlesTable.difficulty,
        basePoints: riddlesTable.basePoints,
        availableFrom: riddlesTable.availableFrom,
        availableUntil: riddlesTable.availableUntil,
        timezone: riddlesTable.timezone,
        status: riddlesTable.status,
        createdBy: riddlesTable.createdBy,
        suggestedBy: riddlesTable.suggestedBy,
        approvedBy: riddlesTable.approvedBy,
        rejectionReason: riddlesTable.rejectionReason,
        teamId: riddlesTable.teamId,
        createdAt: riddlesTable.createdAt,
        updatedAt: riddlesTable.updatedAt,
        responseCount: sql<number>`count(${riddleResponsesTable.id})`,
      })
      .from(riddlesTable)
      .leftJoin(riddleResponsesTable, eq(riddlesTable.id, riddleResponsesTable.riddleId))
      .where(
        and(
          eq(riddlesTable.status, 'active'),
          lte(riddlesTable.availableFrom, now),
          gte(riddlesTable.availableUntil, now),
          teamId ? eq(riddlesTable.teamId, teamId) : sql`${riddlesTable.teamId} IS NULL`,
        ),
      )
      .groupBy(riddlesTable.id)
      .orderBy(riddlesTable.availableFrom)

    return {
      isSuccess: true,
      message: 'Active riddles retrieved successfully',
      data: riddles,
    }
  } catch (error) {
    console.error('Error getting active riddles:', error)
    return { isSuccess: false, message: 'Failed to get active riddles' }
  }
}

export async function getPendingRiddles(): Promise<
  ActionState<(SelectRiddle & { responseCount: number })[]>
> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    // Check if user is pro member
    const profile = await db.query.profiles.findFirst({
      where: eq(profilesTable.userId, userId),
    })

    if (!profile || profile.membership !== 'pro') {
      return { isSuccess: false, message: 'Pro membership required' }
    }

    const riddles = await db
      .select({
        id: riddlesTable.id,
        title: riddlesTable.title,
        slug: riddlesTable.slug,
        description: riddlesTable.description,
        question: riddlesTable.question,
        imageUrl: riddlesTable.imageUrl,
        answerType: riddlesTable.answerType,
        correctAnswer: riddlesTable.correctAnswer,
        multipleChoiceOptions: riddlesTable.multipleChoiceOptions,
        category: riddlesTable.category,
        difficulty: riddlesTable.difficulty,
        basePoints: riddlesTable.basePoints,
        availableFrom: riddlesTable.availableFrom,
        availableUntil: riddlesTable.availableUntil,
        timezone: riddlesTable.timezone,
        status: riddlesTable.status,
        createdBy: riddlesTable.createdBy,
        suggestedBy: riddlesTable.suggestedBy,
        approvedBy: riddlesTable.approvedBy,
        rejectionReason: riddlesTable.rejectionReason,
        teamId: riddlesTable.teamId,
        createdAt: riddlesTable.createdAt,
        updatedAt: riddlesTable.updatedAt,
        responseCount: sql<number>`count(${riddleResponsesTable.id})`,
      })
      .from(riddlesTable)
      .leftJoin(riddleResponsesTable, eq(riddlesTable.id, riddleResponsesTable.riddleId))
      .where(eq(riddlesTable.status, 'suggested'))
      .groupBy(riddlesTable.id)
      .orderBy(riddlesTable.createdAt)

    return {
      isSuccess: true,
      message: 'Pending riddles retrieved successfully',
      data: riddles,
    }
  } catch (error) {
    console.error('Error getting pending riddles:', error)
    return { isSuccess: false, message: 'Failed to get pending riddles' }
  }
}

export async function getApprovedRiddles(): Promise<
  ActionState<(SelectRiddle & { responseCount: number })[]>
> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    // Check if user is pro member
    const profile = await db.query.profiles.findFirst({
      where: eq(profilesTable.userId, userId),
    })

    if (!profile || profile.membership !== 'pro') {
      return { isSuccess: false, message: 'Pro membership required' }
    }

    const riddles = await db
      .select({
        id: riddlesTable.id,
        title: riddlesTable.title,
        slug: riddlesTable.slug,
        description: riddlesTable.description,
        question: riddlesTable.question,
        imageUrl: riddlesTable.imageUrl,
        answerType: riddlesTable.answerType,
        correctAnswer: riddlesTable.correctAnswer,
        multipleChoiceOptions: riddlesTable.multipleChoiceOptions,
        category: riddlesTable.category,
        difficulty: riddlesTable.difficulty,
        basePoints: riddlesTable.basePoints,
        availableFrom: riddlesTable.availableFrom,
        availableUntil: riddlesTable.availableUntil,
        timezone: riddlesTable.timezone,
        status: riddlesTable.status,
        createdBy: riddlesTable.createdBy,
        suggestedBy: riddlesTable.suggestedBy,
        approvedBy: riddlesTable.approvedBy,
        rejectionReason: riddlesTable.rejectionReason,
        teamId: riddlesTable.teamId,
        createdAt: riddlesTable.createdAt,
        updatedAt: riddlesTable.updatedAt,
        responseCount: sql<number>`count(${riddleResponsesTable.id})`,
      })
      .from(riddlesTable)
      .leftJoin(riddleResponsesTable, eq(riddlesTable.id, riddleResponsesTable.riddleId))
      .where(eq(riddlesTable.status, 'approved'))
      .groupBy(riddlesTable.id)
      .orderBy(riddlesTable.createdAt)

    return {
      isSuccess: true,
      message: 'Approved riddles retrieved successfully',
      data: riddles,
    }
  } catch (error) {
    console.error('Error getting approved riddles:', error)
    return { isSuccess: false, message: 'Failed to get approved riddles' }
  }
}

export async function getRejectedRiddles(): Promise<
  ActionState<(SelectRiddle & { responseCount: number })[]>
> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    // Check if user is pro member
    const profile = await db.query.profiles.findFirst({
      where: eq(profilesTable.userId, userId),
    })

    if (!profile || profile.membership !== 'pro') {
      return { isSuccess: false, message: 'Pro membership required' }
    }

    const riddles = await db
      .select({
        id: riddlesTable.id,
        title: riddlesTable.title,
        slug: riddlesTable.slug,
        description: riddlesTable.description,
        question: riddlesTable.question,
        imageUrl: riddlesTable.imageUrl,
        answerType: riddlesTable.answerType,
        correctAnswer: riddlesTable.correctAnswer,
        multipleChoiceOptions: riddlesTable.multipleChoiceOptions,
        category: riddlesTable.category,
        difficulty: riddlesTable.difficulty,
        basePoints: riddlesTable.basePoints,
        availableFrom: riddlesTable.availableFrom,
        availableUntil: riddlesTable.availableUntil,
        timezone: riddlesTable.timezone,
        status: riddlesTable.status,
        createdBy: riddlesTable.createdBy,
        suggestedBy: riddlesTable.suggestedBy,
        approvedBy: riddlesTable.approvedBy,
        rejectionReason: riddlesTable.rejectionReason,
        teamId: riddlesTable.teamId,
        createdAt: riddlesTable.createdAt,
        updatedAt: riddlesTable.updatedAt,
        responseCount: sql<number>`count(${riddleResponsesTable.id})`,
      })
      .from(riddlesTable)
      .leftJoin(riddleResponsesTable, eq(riddlesTable.id, riddleResponsesTable.riddleId))
      .where(eq(riddlesTable.status, 'archived'))
      .groupBy(riddlesTable.id)
      .orderBy(riddlesTable.createdAt)

    return {
      isSuccess: true,
      message: 'Rejected riddles retrieved successfully',
      data: riddles,
    }
  } catch (error) {
    console.error('Error getting rejected riddles:', error)
    return { isSuccess: false, message: 'Failed to get rejected riddles' }
  }
}

export async function updateRiddle(
  id: string,
  data: Partial<InsertRiddle>,
): Promise<ActionState<SelectRiddle>> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    const riddle = await db.query.riddles.findFirst({
      where: eq(riddlesTable.id, id),
    })

    if (!riddle) {
      return { isSuccess: false, message: 'Riddle not found' }
    }

    // Check if user can edit this riddle
    if (riddle.createdBy !== userId) {
      // Check if user is pro member
      const profile = await db.query.profiles.findFirst({
        where: eq(profilesTable.userId, userId),
      })

      if (!profile || profile.membership !== 'pro') {
        return { isSuccess: false, message: 'Only the creator or pro members can edit riddles' }
      }
    }

    const updateData = { ...data }

    // Generate new slug if title is being updated
    if (data.title) {
      updateData.slug = generateSlug(data.title)
    }

    // Recalculate points if difficulty is being updated
    if (data.difficulty) {
      updateData.basePoints = calculatePoints(data.difficulty)
    }

    const [updatedRiddle] = await db
      .update(riddlesTable)
      .set(updateData)
      .where(eq(riddlesTable.id, id))
      .returning()

    return {
      isSuccess: true,
      message: 'Riddle updated successfully',
      data: updatedRiddle,
    }
  } catch (error) {
    console.error('Error updating riddle:', error)
    return { isSuccess: false, message: 'Failed to update riddle' }
  }
}

export async function approveRiddle(id: string): Promise<ActionState<SelectRiddle>> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    // Check if user is pro member
    const profile = await db.query.profiles.findFirst({
      where: eq(profilesTable.userId, userId),
    })

    if (!profile || profile.membership !== 'pro') {
      return { isSuccess: false, message: 'Pro membership required' }
    }

    const [approvedRiddle] = await db
      .update(riddlesTable)
      .set({
        status: 'approved',
        approvedBy: userId,
      })
      .where(eq(riddlesTable.id, id))
      .returning()

    return {
      isSuccess: true,
      message: 'Riddle approved successfully',
      data: approvedRiddle,
    }
  } catch (error) {
    console.error('Error approving riddle:', error)
    return { isSuccess: false, message: 'Failed to approve riddle' }
  }
}

export async function rejectRiddle(id: string, reason: string): Promise<ActionState<SelectRiddle>> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    // Check if user is pro member
    const profile = await db.query.profiles.findFirst({
      where: eq(profilesTable.userId, userId),
    })

    if (!profile || profile.membership !== 'pro') {
      return { isSuccess: false, message: 'Pro membership required' }
    }

    const [rejectedRiddle] = await db
      .update(riddlesTable)
      .set({
        status: 'archived',
        rejectionReason: reason,
        approvedBy: userId,
      })
      .where(eq(riddlesTable.id, id))
      .returning()

    return {
      isSuccess: true,
      message: 'Riddle rejected successfully',
      data: rejectedRiddle,
    }
  } catch (error) {
    console.error('Error rejecting riddle:', error)
    return { isSuccess: false, message: 'Failed to reject riddle' }
  }
}

export async function scheduleRiddle(
  id: string,
  availableFrom: Date,
  availableUntil: Date,
): Promise<ActionState<SelectRiddle>> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    // Check if user is pro member
    const profile = await db.query.profiles.findFirst({
      where: eq(profilesTable.userId, userId),
    })

    if (!profile || profile.membership !== 'pro') {
      return { isSuccess: false, message: 'Pro membership required' }
    }

    const [scheduledRiddle] = await db
      .update(riddlesTable)
      .set({
        availableFrom,
        availableUntil,
        status: 'scheduled',
      })
      .where(eq(riddlesTable.id, id))
      .returning()

    return {
      isSuccess: true,
      message: 'Riddle scheduled successfully',
      data: scheduledRiddle,
    }
  } catch (error) {
    console.error('Error scheduling riddle:', error)
    return { isSuccess: false, message: 'Failed to schedule riddle' }
  }
}

export async function deleteRiddle(id: string): Promise<ActionState<void>> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    const riddle = await db.query.riddles.findFirst({
      where: eq(riddlesTable.id, id),
    })

    if (!riddle) {
      return { isSuccess: false, message: 'Riddle not found' }
    }

    // Check if user can delete this riddle
    if (riddle.createdBy !== userId) {
      // Check if user is pro member
      const profile = await db.query.profiles.findFirst({
        where: eq(profilesTable.userId, userId),
      })

      if (!profile || profile.membership !== 'pro') {
        return { isSuccess: false, message: 'Only the creator or pro members can delete riddles' }
      }
    }

    await db.delete(riddlesTable).where(eq(riddlesTable.id, id))

    return {
      isSuccess: true,
      message: 'Riddle deleted successfully',
      data: undefined,
    }
  } catch (error) {
    console.error('Error deleting riddle:', error)
    return { isSuccess: false, message: 'Failed to delete riddle' }
  }
}

// Response Operations
export async function submitResponse(
  riddleId: string,
  answer: string,
): Promise<ActionState<SelectRiddleResponse>> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    // Get riddle details
    const riddle = await db.query.riddles.findFirst({
      where: eq(riddlesTable.id, riddleId),
    })

    if (!riddle) {
      return { isSuccess: false, message: 'Riddle not found' }
    }

    // Check if riddle is active and within time window
    const now = new Date()
    if (riddle.status !== 'active' || now < riddle.availableFrom || now > riddle.availableUntil) {
      return { isSuccess: false, message: 'Riddle is not currently available for responses' }
    }

    // Check if user already responded
    const existingResponse = await db.query.riddleResponses.findFirst({
      where: and(
        eq(riddleResponsesTable.riddleId, riddleId),
        eq(riddleResponsesTable.userId, userId),
      ),
    })

    if (existingResponse) {
      return { isSuccess: false, message: 'You have already responded to this riddle' }
    }

    // Validate answer and calculate points
    const isCorrect = validateAnswer(answer, riddle.correctAnswer, riddle.answerType)
    const pointsEarned = isCorrect ? riddle.basePoints : 0

    // Get user's team if they have one
    let teamId = null
    if (riddle.teamId) {
      const membership = await db.query.teamMemberships.findFirst({
        where: and(
          eq(teamMembershipsTable.teamId, riddle.teamId),
          eq(teamMembershipsTable.userId, userId),
        ),
      })
      teamId = membership?.teamId || null
    }

    const [newResponse] = await db
      .insert(riddleResponsesTable)
      .values({
        riddleId,
        userId,
        teamId,
        answer,
        isCorrect,
        pointsEarned,
        submittedAt: now,
      })
      .returning()

    return {
      isSuccess: true,
      message: isCorrect ? 'Correct answer! Points earned.' : 'Answer submitted, but incorrect.',
      data: newResponse,
    }
  } catch (error) {
    console.error('Error submitting response:', error)
    return { isSuccess: false, message: 'Failed to submit response' }
  }
}

export async function updateResponse(
  responseId: string,
  answer: string,
): Promise<ActionState<SelectRiddleResponse>> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    // Get existing response
    const existingResponse = await db.query.riddleResponses.findFirst({
      where: eq(riddleResponsesTable.id, responseId),
    })

    if (!existingResponse) {
      return { isSuccess: false, message: 'Response not found' }
    }

    if (existingResponse.userId !== userId) {
      return { isSuccess: false, message: 'You can only edit your own responses' }
    }

    // Get riddle details
    const riddle = await db.query.riddles.findFirst({
      where: eq(riddlesTable.id, existingResponse.riddleId),
    })

    if (!riddle) {
      return { isSuccess: false, message: 'Riddle not found' }
    }

    // Check if riddle is still active and within time window
    const now = new Date()
    if (riddle.status !== 'active' || now < riddle.availableFrom || now > riddle.availableUntil) {
      return { isSuccess: false, message: 'Riddle is no longer available for editing responses' }
    }

    // Validate answer and calculate points
    const isCorrect = validateAnswer(answer, riddle.correctAnswer, riddle.answerType)
    const pointsEarned = isCorrect ? riddle.basePoints : 0

    const [updatedResponse] = await db
      .update(riddleResponsesTable)
      .set({
        answer,
        isCorrect,
        pointsEarned,
        submittedAt: now,
      })
      .where(eq(riddleResponsesTable.id, responseId))
      .returning()

    return {
      isSuccess: true,
      message: isCorrect ? 'Response updated! Correct answer.' : 'Response updated, but incorrect.',
      data: updatedResponse,
    }
  } catch (error) {
    console.error('Error updating response:', error)
    return { isSuccess: false, message: 'Failed to update response' }
  }
}

export async function getUserResponse(
  riddleId: string,
): Promise<ActionState<SelectRiddleResponse | null>> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    const response = await db.query.riddleResponses.findFirst({
      where: and(
        eq(riddleResponsesTable.riddleId, riddleId),
        eq(riddleResponsesTable.userId, userId),
      ),
    })

    return {
      isSuccess: true,
      message: 'User response retrieved successfully',
      data: response || null,
    }
  } catch (error) {
    console.error('Error getting user response:', error)
    return { isSuccess: false, message: 'Failed to get user response' }
  }
}

export async function getRiddleResponses(
  riddleId: string,
): Promise<ActionState<(SelectRiddleResponse & { displayName: string | null })[]>> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    // Check if user is pro member
    const profile = await db.query.profiles.findFirst({
      where: eq(profilesTable.userId, userId),
    })

    if (!profile || profile.membership !== 'pro') {
      return { isSuccess: false, message: 'Pro membership required' }
    }

    const responses = await db
      .select({
        id: riddleResponsesTable.id,
        riddleId: riddleResponsesTable.riddleId,
        userId: riddleResponsesTable.userId,
        teamId: riddleResponsesTable.teamId,
        answer: riddleResponsesTable.answer,
        isCorrect: riddleResponsesTable.isCorrect,
        pointsEarned: riddleResponsesTable.pointsEarned,
        submittedAt: riddleResponsesTable.submittedAt,
        createdAt: riddleResponsesTable.createdAt,
        updatedAt: riddleResponsesTable.updatedAt,
        displayName: profilesTable.displayName,
      })
      .from(riddleResponsesTable)
      .innerJoin(profilesTable, eq(riddleResponsesTable.userId, profilesTable.userId))
      .where(eq(riddleResponsesTable.riddleId, riddleId))
      .orderBy(riddleResponsesTable.submittedAt)

    return {
      isSuccess: true,
      message: 'Riddle responses retrieved successfully',
      data: responses,
    }
  } catch (error) {
    console.error('Error getting riddle responses:', error)
    return { isSuccess: false, message: 'Failed to get riddle responses' }
  }
}
