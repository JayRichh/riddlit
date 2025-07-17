'use server'

import { auth } from '@clerk/nextjs/server'
import { desc, eq, sql } from 'drizzle-orm'

import { db } from '@/db/db'
import { profilesTable } from '@/db/schema/profiles'
import { riddleResponsesTable, riddlesTable } from '@/db/schema/riddles'
import { teamMembershipsTable, teamsTable } from '@/db/schema/teams'
import { ActionState } from '@/lib/types/server-action'

// Types for leaderboard data
export type LeaderboardUser = {
  userId: string
  displayName: string | null
  totalPoints: number
  riddlesSolved: number
  currentStreak: number
  longestStreak: number
  rank: number
}

export type LeaderboardTeam = {
  teamId: string
  name: string
  slug: string
  totalPoints: number
  memberCount: number
  avgPointsPerMember: number
  rank: number
}

export type UserStats = {
  totalPoints: number
  riddlesSolved: number
  currentStreak: number
  longestStreak: number
  rank: number
  correctAnswers: number
  totalResponses: number
  accuracyRate: number
  categoryStats: {
    category: string
    solved: number
    totalPoints: number
    accuracyRate: number
  }[]
  difficultyStats: {
    difficulty: string
    solved: number
    totalPoints: number
    accuracyRate: number
  }[]
}

export type TeamStats = {
  teamId: string
  name: string
  memberCount: number
  totalPoints: number
  avgPointsPerMember: number
  rank: number
  recentActivity: {
    userId: string
    displayName: string | null
    riddleTitle: string
    pointsEarned: number
    submittedAt: Date
  }[]
}

export type GlobalStats = {
  totalUsers: number
  totalTeams: number
  totalRiddles: number
  totalResponses: number
  activeRiddles: number
  averageAccuracy: number
  topCategory: string
  topDifficulty: string
}

// Individual Leaderboard
export async function getIndividualLeaderboard(
  limit: number = 50,
): Promise<ActionState<LeaderboardUser[]>> {
  try {
    const users = await db
      .select({
        userId: profilesTable.userId,
        displayName: profilesTable.displayName,
        totalPoints: profilesTable.totalPoints,
        riddlesSolved: profilesTable.riddlesSolved,
        currentStreak: profilesTable.currentStreak,
        longestStreak: profilesTable.longestStreak,
        rank: sql<number>`ROW_NUMBER() OVER (ORDER BY ${profilesTable.totalPoints} DESC)`,
      })
      .from(profilesTable)
      .where(sql`${profilesTable.totalPoints} > 0`)
      .orderBy(desc(profilesTable.totalPoints))
      .limit(limit)

    return {
      isSuccess: true,
      message: 'Individual leaderboard retrieved successfully',
      data: users,
    }
  } catch (error) {
    console.error('Error getting individual leaderboard:', error)
    return { isSuccess: false, message: 'Failed to get individual leaderboard' }
  }
}

// Team Leaderboard
export async function getTeamLeaderboard(
  limit: number = 50,
): Promise<ActionState<LeaderboardTeam[]>> {
  try {
    const teams = await db
      .select({
        teamId: teamsTable.id,
        name: teamsTable.name,
        slug: teamsTable.slug,
        totalPoints: sql<number>`SUM(${profilesTable.totalPoints})`,
        memberCount: sql<number>`COUNT(${teamMembershipsTable.id})`,
        avgPointsPerMember: sql<number>`ROUND(AVG(${profilesTable.totalPoints}), 2)`,
        rank: sql<number>`ROW_NUMBER() OVER (ORDER BY SUM(${profilesTable.totalPoints}) DESC)`,
      })
      .from(teamsTable)
      .innerJoin(teamMembershipsTable, eq(teamsTable.id, teamMembershipsTable.teamId))
      .innerJoin(profilesTable, eq(teamMembershipsTable.userId, profilesTable.userId))
      .groupBy(teamsTable.id, teamsTable.name, teamsTable.slug)
      .having(sql`SUM(${profilesTable.totalPoints}) > 0`)
      .orderBy(sql`SUM(${profilesTable.totalPoints}) DESC`)
      .limit(limit)

    return {
      isSuccess: true,
      message: 'Team leaderboard retrieved successfully',
      data: teams,
    }
  } catch (error) {
    console.error('Error getting team leaderboard:', error)
    return { isSuccess: false, message: 'Failed to get team leaderboard' }
  }
}

// User Statistics
export async function getUserStats(userId?: string): Promise<ActionState<UserStats>> {
  try {
    const { userId: authUserId } = await auth()
    const targetUserId = userId || authUserId

    if (!targetUserId) {
      return { isSuccess: false, message: 'User ID required' }
    }

    // Get basic user stats
    const userProfile = await db.query.profiles.findFirst({
      where: eq(profilesTable.userId, targetUserId),
    })

    if (!userProfile) {
      return { isSuccess: false, message: 'User not found' }
    }

    // Get user rank
    const [rankResult] = await db
      .select({
        rank: sql<number>`COUNT(*) + 1`,
      })
      .from(profilesTable)
      .where(sql`${profilesTable.totalPoints} > ${userProfile.totalPoints}`)

    // Get response statistics
    const [responseStats] = await db
      .select({
        totalResponses: sql<number>`COUNT(*)`,
        correctAnswers: sql<number>`COUNT(*) FILTER (WHERE ${riddleResponsesTable.isCorrect} = true)`,
      })
      .from(riddleResponsesTable)
      .where(eq(riddleResponsesTable.userId, targetUserId))

    const accuracyRate =
      responseStats.totalResponses > 0
        ? (responseStats.correctAnswers / responseStats.totalResponses) * 100
        : 0

    // Get category statistics
    const categoryStats = await db
      .select({
        category: riddlesTable.category,
        solved: sql<number>`COUNT(*) FILTER (WHERE ${riddleResponsesTable.isCorrect} = true)`,
        totalPoints: sql<number>`SUM(${riddleResponsesTable.pointsEarned})`,
        totalResponses: sql<number>`COUNT(*)`,
        correctResponses: sql<number>`COUNT(*) FILTER (WHERE ${riddleResponsesTable.isCorrect} = true)`,
      })
      .from(riddleResponsesTable)
      .innerJoin(riddlesTable, eq(riddleResponsesTable.riddleId, riddlesTable.id))
      .where(eq(riddleResponsesTable.userId, targetUserId))
      .groupBy(riddlesTable.category)

    // Get difficulty statistics
    const difficultyStats = await db
      .select({
        difficulty: riddlesTable.difficulty,
        solved: sql<number>`COUNT(*) FILTER (WHERE ${riddleResponsesTable.isCorrect} = true)`,
        totalPoints: sql<number>`SUM(${riddleResponsesTable.pointsEarned})`,
        totalResponses: sql<number>`COUNT(*)`,
        correctResponses: sql<number>`COUNT(*) FILTER (WHERE ${riddleResponsesTable.isCorrect} = true)`,
      })
      .from(riddleResponsesTable)
      .innerJoin(riddlesTable, eq(riddleResponsesTable.riddleId, riddlesTable.id))
      .where(eq(riddleResponsesTable.userId, targetUserId))
      .groupBy(riddlesTable.difficulty)

    const userStats: UserStats = {
      totalPoints: userProfile.totalPoints,
      riddlesSolved: userProfile.riddlesSolved,
      currentStreak: userProfile.currentStreak,
      longestStreak: userProfile.longestStreak,
      rank: rankResult.rank,
      correctAnswers: responseStats.correctAnswers,
      totalResponses: responseStats.totalResponses,
      accuracyRate: Math.round(accuracyRate),
      categoryStats: categoryStats.map((stat) => ({
        category: stat.category,
        solved: stat.solved,
        totalPoints: stat.totalPoints,
        accuracyRate:
          stat.totalResponses > 0
            ? Math.round((stat.correctResponses / stat.totalResponses) * 100)
            : 0,
      })),
      difficultyStats: difficultyStats.map((stat) => ({
        difficulty: stat.difficulty,
        solved: stat.solved,
        totalPoints: stat.totalPoints,
        accuracyRate:
          stat.totalResponses > 0
            ? Math.round((stat.correctResponses / stat.totalResponses) * 100)
            : 0,
      })),
    }

    return {
      isSuccess: true,
      message: 'User statistics retrieved successfully',
      data: userStats,
    }
  } catch (error) {
    console.error('Error getting user stats:', error)
    return { isSuccess: false, message: 'Failed to get user statistics' }
  }
}

// Team Statistics
export async function getTeamStats(teamId: string): Promise<ActionState<TeamStats>> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    // Get team basic info
    const team = await db.query.teams.findFirst({
      where: eq(teamsTable.id, teamId),
    })

    if (!team) {
      return { isSuccess: false, message: 'Team not found' }
    }

    // Get team statistics
    const [teamStats] = await db
      .select({
        memberCount: sql<number>`COUNT(${teamMembershipsTable.id})`,
        totalPoints: sql<number>`SUM(${profilesTable.totalPoints})`,
        avgPointsPerMember: sql<number>`ROUND(AVG(${profilesTable.totalPoints}), 2)`,
      })
      .from(teamMembershipsTable)
      .innerJoin(profilesTable, eq(teamMembershipsTable.userId, profilesTable.userId))
      .where(eq(teamMembershipsTable.teamId, teamId))

    // Get team rank
    const [rankResult] = await db
      .select({
        rank: sql<number>`COUNT(*) + 1`,
      })
      .from(
        sql`(
        SELECT SUM(${profilesTable.totalPoints}) as team_points
        FROM ${teamMembershipsTable}
        INNER JOIN ${profilesTable} ON ${teamMembershipsTable.userId} = ${profilesTable.userId}
        GROUP BY ${teamMembershipsTable.teamId}
      ) as team_totals`,
      )
      .where(sql`team_points > ${teamStats.totalPoints}`)

    // Get recent activity
    const recentActivity = await db
      .select({
        userId: riddleResponsesTable.userId,
        displayName: profilesTable.displayName,
        riddleTitle: riddlesTable.title,
        pointsEarned: riddleResponsesTable.pointsEarned,
        submittedAt: riddleResponsesTable.submittedAt,
      })
      .from(riddleResponsesTable)
      .innerJoin(profilesTable, eq(riddleResponsesTable.userId, profilesTable.userId))
      .innerJoin(riddlesTable, eq(riddleResponsesTable.riddleId, riddlesTable.id))
      .innerJoin(teamMembershipsTable, eq(riddleResponsesTable.userId, teamMembershipsTable.userId))
      .where(eq(teamMembershipsTable.teamId, teamId))
      .orderBy(desc(riddleResponsesTable.submittedAt))
      .limit(10)

    const result: TeamStats = {
      teamId: team.id,
      name: team.name,
      memberCount: teamStats.memberCount,
      totalPoints: teamStats.totalPoints || 0,
      avgPointsPerMember: teamStats.avgPointsPerMember || 0,
      rank: rankResult.rank,
      recentActivity,
    }

    return {
      isSuccess: true,
      message: 'Team statistics retrieved successfully',
      data: result,
    }
  } catch (error) {
    console.error('Error getting team stats:', error)
    return { isSuccess: false, message: 'Failed to get team statistics' }
  }
}

// Global Statistics
export async function getGlobalStats(): Promise<ActionState<GlobalStats>> {
  try {
    // Get total counts
    const [totalUsers] = await db.select({ count: sql<number>`COUNT(*)` }).from(profilesTable)

    const [totalTeams] = await db.select({ count: sql<number>`COUNT(*)` }).from(teamsTable)

    const [totalRiddles] = await db.select({ count: sql<number>`COUNT(*)` }).from(riddlesTable)

    const [totalResponses] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(riddleResponsesTable)

    const [activeRiddles] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(riddlesTable)
      .where(eq(riddlesTable.status, 'active'))

    // Get average accuracy
    const [accuracyResult] = await db
      .select({
        accuracy: sql<number>`ROUND(AVG(CASE WHEN ${riddleResponsesTable.isCorrect} THEN 1.0 ELSE 0.0 END) * 100, 2)`,
      })
      .from(riddleResponsesTable)

    // Get top category
    const [topCategoryResult] = await db
      .select({
        category: riddlesTable.category,
        responseCount: sql<number>`COUNT(*)`,
      })
      .from(riddleResponsesTable)
      .innerJoin(riddlesTable, eq(riddleResponsesTable.riddleId, riddlesTable.id))
      .groupBy(riddlesTable.category)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(1)

    // Get top difficulty
    const [topDifficultyResult] = await db
      .select({
        difficulty: riddlesTable.difficulty,
        responseCount: sql<number>`COUNT(*)`,
      })
      .from(riddleResponsesTable)
      .innerJoin(riddlesTable, eq(riddleResponsesTable.riddleId, riddlesTable.id))
      .groupBy(riddlesTable.difficulty)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(1)

    const globalStats: GlobalStats = {
      totalUsers: totalUsers.count,
      totalTeams: totalTeams.count,
      totalRiddles: totalRiddles.count,
      totalResponses: totalResponses.count,
      activeRiddles: activeRiddles.count,
      averageAccuracy: accuracyResult.accuracy || 0,
      topCategory: topCategoryResult?.category || 'N/A',
      topDifficulty: topDifficultyResult?.difficulty || 'N/A',
    }

    return {
      isSuccess: true,
      message: 'Global statistics retrieved successfully',
      data: globalStats,
    }
  } catch (error) {
    console.error('Error getting global stats:', error)
    return { isSuccess: false, message: 'Failed to get global statistics' }
  }
}

// Recent Activity
export async function getRecentActivity(limit: number = 20): Promise<
  ActionState<
    {
      userId: string
      displayName: string | null
      riddleTitle: string
      riddleSlug: string
      pointsEarned: number
      isCorrect: boolean
      submittedAt: Date
    }[]
  >
> {
  try {
    const recentActivity = await db
      .select({
        userId: riddleResponsesTable.userId,
        displayName: profilesTable.displayName,
        riddleTitle: riddlesTable.title,
        riddleSlug: riddlesTable.slug,
        pointsEarned: riddleResponsesTable.pointsEarned,
        isCorrect: riddleResponsesTable.isCorrect,
        submittedAt: riddleResponsesTable.submittedAt,
      })
      .from(riddleResponsesTable)
      .innerJoin(profilesTable, eq(riddleResponsesTable.userId, profilesTable.userId))
      .innerJoin(riddlesTable, eq(riddleResponsesTable.riddleId, riddlesTable.id))
      .orderBy(desc(riddleResponsesTable.submittedAt))
      .limit(limit)

    return {
      isSuccess: true,
      message: 'Recent activity retrieved successfully',
      data: recentActivity,
    }
  } catch (error) {
    console.error('Error getting recent activity:', error)
    return { isSuccess: false, message: 'Failed to get recent activity' }
  }
}

// User's Team Performance
export async function getUserTeamPerformance(): Promise<
  ActionState<
    {
      teamId: string
      teamName: string
      userRank: number
      totalMembers: number
      userPoints: number
      teamTotalPoints: number
    }[]
  >
> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    const userTeams = await db
      .select({
        teamId: teamsTable.id,
        teamName: teamsTable.name,
        userPoints: profilesTable.totalPoints,
        teamTotalPoints: sql<number>`SUM(all_profiles.total_points) OVER (PARTITION BY ${teamsTable.id})`,
        totalMembers: sql<number>`COUNT(*) OVER (PARTITION BY ${teamsTable.id})`,
        userRank: sql<number>`RANK() OVER (PARTITION BY ${teamsTable.id} ORDER BY ${profilesTable.totalPoints} DESC)`,
      })
      .from(teamMembershipsTable)
      .innerJoin(teamsTable, eq(teamMembershipsTable.teamId, teamsTable.id))
      .innerJoin(profilesTable, eq(teamMembershipsTable.userId, profilesTable.userId))
      .innerJoin(
        sql`${teamMembershipsTable} team_all ON ${teamsTable.id} = team_all.team_id`,
        sql`true`,
      )
      .innerJoin(
        sql`${profilesTable} all_profiles ON team_all.user_id = all_profiles.user_id`,
        sql`true`,
      )
      .where(eq(teamMembershipsTable.userId, userId))

    return {
      isSuccess: true,
      message: 'User team performance retrieved successfully',
      data: userTeams,
    }
  } catch (error) {
    console.error('Error getting user team performance:', error)
    return { isSuccess: false, message: 'Failed to get user team performance' }
  }
}

// Dashboard Summary
export async function getDashboardSummary(): Promise<
  ActionState<{
    userStats: {
      totalPoints: number
      riddlesSolved: number
      currentStreak: number
      rank: number
    }
    globalStats: {
      totalUsers: number
      activeRiddles: number
      totalResponses: number
    }
    recentActivity: {
      userId: string
      displayName: string | null
      riddleTitle: string
      riddleSlug: string
      pointsEarned: number
      submittedAt: Date
    }[]
    topPerformers: {
      userId: string
      displayName: string | null
      totalPoints: number
    }[]
  }>
> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    // Get user stats
    const userProfile = await db.query.profiles.findFirst({
      where: eq(profilesTable.userId, userId),
    })

    if (!userProfile) {
      return { isSuccess: false, message: 'User profile not found' }
    }

    // Get user rank
    const [rankResult] = await db
      .select({
        rank: sql<number>`COUNT(*) + 1`,
      })
      .from(profilesTable)
      .where(sql`${profilesTable.totalPoints} > ${userProfile.totalPoints}`)

    // Get global stats
    const [globalCounts] = await db
      .select({
        totalUsers: sql<number>`(SELECT COUNT(*) FROM ${profilesTable})`,
        activeRiddles: sql<number>`(SELECT COUNT(*) FROM ${riddlesTable} WHERE status = 'active')`,
        totalResponses: sql<number>`(SELECT COUNT(*) FROM ${riddleResponsesTable})`,
      })
      .from(sql`(SELECT 1) as dummy`)

    // Get recent activity
    const recentActivity = await db
      .select({
        userId: riddleResponsesTable.userId,
        displayName: profilesTable.displayName,
        riddleTitle: riddlesTable.title,
        riddleSlug: riddlesTable.slug,
        pointsEarned: riddleResponsesTable.pointsEarned,
        submittedAt: riddleResponsesTable.submittedAt,
      })
      .from(riddleResponsesTable)
      .innerJoin(profilesTable, eq(riddleResponsesTable.userId, profilesTable.userId))
      .innerJoin(riddlesTable, eq(riddleResponsesTable.riddleId, riddlesTable.id))
      .orderBy(desc(riddleResponsesTable.submittedAt))
      .limit(5)

    // Get top performers
    const topPerformers = await db
      .select({
        userId: profilesTable.userId,
        displayName: profilesTable.displayName,
        totalPoints: profilesTable.totalPoints,
      })
      .from(profilesTable)
      .where(sql`${profilesTable.totalPoints} > 0`)
      .orderBy(desc(profilesTable.totalPoints))
      .limit(5)

    const summary = {
      userStats: {
        totalPoints: userProfile.totalPoints,
        riddlesSolved: userProfile.riddlesSolved,
        currentStreak: userProfile.currentStreak,
        rank: rankResult.rank,
      },
      globalStats: {
        totalUsers: globalCounts.totalUsers,
        activeRiddles: globalCounts.activeRiddles,
        totalResponses: globalCounts.totalResponses,
      },
      recentActivity,
      topPerformers,
    }

    return {
      isSuccess: true,
      message: 'Dashboard summary retrieved successfully',
      data: summary,
    }
  } catch (error) {
    console.error('Error getting dashboard summary:', error)
    return { isSuccess: false, message: 'Failed to get dashboard summary' }
  }
}
