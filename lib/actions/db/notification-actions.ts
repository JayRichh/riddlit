'use server'

import { auth } from '@clerk/nextjs/server'
import { and, desc, eq, sql } from 'drizzle-orm'

import { db } from '@/db/db'
import {
  NotificationEvent,
  notificationPreferencesTable,
  notificationsTable,
  NotificationType,
  SelectNotification,
  SelectNotificationPreference,
} from '@/db/schema/notifications'
import { profilesTable } from '@/db/schema/profiles'
import { ActionState } from '@/lib/types/server-action'

// Notification CRUD Operations
export async function createNotification(
  userId: string,
  type: NotificationType,
  event: NotificationEvent,
  title: string,
  message: string,
  metadata?: Record<string, unknown>,
): Promise<ActionState<SelectNotification>> {
  try {
    const [newNotification] = await db
      .insert(notificationsTable)
      .values({
        userId,
        type,
        event,
        title,
        message,
        metadata: metadata ? JSON.stringify(metadata) : null,
      })
      .returning()

    return {
      isSuccess: true,
      message: 'Notification created successfully',
      data: newNotification,
    }
  } catch (error) {
    console.error('Error creating notification:', error)
    return { isSuccess: false, message: 'Failed to create notification' }
  }
}

export async function createNotificationWithPreferences(
  userId: string,
  type: NotificationType,
  event: NotificationEvent,
  title: string,
  message: string,
  metadata?: Record<string, unknown>,
): Promise<ActionState<SelectNotification | null>> {
  try {
    // Use the database function that checks preferences
    const result = await db.execute(
      sql`SELECT create_notification_with_preferences(${userId}, ${type}, ${event}, ${title}, ${message}, ${metadata ? JSON.stringify(metadata) : null})`,
    )

    const notificationId = result[0]?.create_notification_with_preferences

    if (!notificationId) {
      return {
        isSuccess: true,
        message: 'Notification not created due to user preferences',
        data: null,
      }
    }

    // Fetch the created notification
    const notification = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.id, notificationId as string))
      .limit(1)

    if (!notification[0]) {
      return { isSuccess: false, message: 'Failed to retrieve created notification' }
    }

    return {
      isSuccess: true,
      message: 'Notification created successfully',
      data: notification[0],
    }
  } catch (error) {
    console.error('Error creating notification with preferences:', error)
    return { isSuccess: false, message: 'Failed to create notification' }
  }
}

export async function getUserNotifications(
  limit: number = 20,
  offset: number = 0,
): Promise<ActionState<SelectNotification[]>> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    const notifications = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.userId, userId))
      .orderBy(desc(notificationsTable.createdAt))
      .limit(limit)
      .offset(offset)

    return {
      isSuccess: true,
      message: 'Notifications retrieved successfully',
      data: notifications,
    }
  } catch (error) {
    console.error('Error getting user notifications:', error)
    return { isSuccess: false, message: 'Failed to get notifications' }
  }
}

export async function getUnreadNotifications(): Promise<ActionState<SelectNotification[]>> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    const unreadNotifications = await db
      .select()
      .from(notificationsTable)
      .where(and(eq(notificationsTable.userId, userId), eq(notificationsTable.read, false)))
      .orderBy(desc(notificationsTable.createdAt))

    return {
      isSuccess: true,
      message: 'Unread notifications retrieved successfully',
      data: unreadNotifications,
    }
  } catch (error) {
    console.error('Error getting unread notifications:', error)
    return { isSuccess: false, message: 'Failed to get unread notifications' }
  }
}

export async function getUnreadNotificationCount(): Promise<ActionState<number>> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    const result = await db.execute(sql`SELECT get_unread_count(${userId})`)
    const count = result[0]?.get_unread_count || 0

    return {
      isSuccess: true,
      message: 'Unread count retrieved successfully',
      data: Number(count),
    }
  } catch (error) {
    console.error('Error getting unread count:', error)
    return { isSuccess: false, message: 'Failed to get unread count' }
  }
}

export async function markNotificationAsRead(
  notificationId: string,
): Promise<ActionState<SelectNotification>> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    const [updatedNotification] = await db
      .update(notificationsTable)
      .set({
        read: true,
        readAt: new Date(),
      })
      .where(and(eq(notificationsTable.id, notificationId), eq(notificationsTable.userId, userId)))
      .returning()

    if (!updatedNotification) {
      return { isSuccess: false, message: 'Notification not found' }
    }

    return {
      isSuccess: true,
      message: 'Notification marked as read',
      data: updatedNotification,
    }
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return { isSuccess: false, message: 'Failed to mark notification as read' }
  }
}

export async function markAllNotificationsAsRead(): Promise<ActionState<void>> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    await db.execute(sql`SELECT mark_notifications_read(${userId})`)

    return {
      isSuccess: true,
      message: 'All notifications marked as read',
      data: undefined,
    }
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return { isSuccess: false, message: 'Failed to mark all notifications as read' }
  }
}

export async function markNotificationsAsRead(
  notificationIds: string[],
): Promise<ActionState<void>> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    await db.execute(sql`SELECT mark_notifications_read(${userId}, ${notificationIds})`)

    return {
      isSuccess: true,
      message: 'Notifications marked as read',
      data: undefined,
    }
  } catch (error) {
    console.error('Error marking notifications as read:', error)
    return { isSuccess: false, message: 'Failed to mark notifications as read' }
  }
}

export async function deleteNotification(notificationId: string): Promise<ActionState<void>> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    await db
      .delete(notificationsTable)
      .where(and(eq(notificationsTable.id, notificationId), eq(notificationsTable.userId, userId)))

    return {
      isSuccess: true,
      message: 'Notification deleted successfully',
      data: undefined,
    }
  } catch (error) {
    console.error('Error deleting notification:', error)
    return { isSuccess: false, message: 'Failed to delete notification' }
  }
}

export async function deleteAllReadNotifications(): Promise<ActionState<void>> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    await db
      .delete(notificationsTable)
      .where(and(eq(notificationsTable.userId, userId), eq(notificationsTable.read, true)))

    return {
      isSuccess: true,
      message: 'All read notifications deleted successfully',
      data: undefined,
    }
  } catch (error) {
    console.error('Error deleting read notifications:', error)
    return { isSuccess: false, message: 'Failed to delete read notifications' }
  }
}

// Notification Preferences Operations
export async function getUserNotificationPreferences(): Promise<
  ActionState<SelectNotificationPreference[]>
> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    const preferences = await db
      .select()
      .from(notificationPreferencesTable)
      .where(eq(notificationPreferencesTable.userId, userId))

    return {
      isSuccess: true,
      message: 'Notification preferences retrieved successfully',
      data: preferences,
    }
  } catch (error) {
    console.error('Error getting notification preferences:', error)
    return { isSuccess: false, message: 'Failed to get notification preferences' }
  }
}

export async function updateNotificationPreference(
  type: NotificationType,
  event: NotificationEvent,
  enabled: boolean,
  emailEnabled?: boolean,
  pushEnabled?: boolean,
): Promise<ActionState<SelectNotificationPreference>> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    const [updatedPreference] = await db
      .insert(notificationPreferencesTable)
      .values({
        userId,
        notificationType: type,
        notificationEvent: event,
        enabled,
        emailEnabled: emailEnabled ?? false,
        pushEnabled: pushEnabled ?? false,
      })
      .onConflictDoUpdate({
        target: [
          notificationPreferencesTable.userId,
          notificationPreferencesTable.notificationType,
          notificationPreferencesTable.notificationEvent,
        ],
        set: {
          enabled,
          emailEnabled: emailEnabled ?? false,
          pushEnabled: pushEnabled ?? false,
          updatedAt: new Date(),
        },
      })
      .returning()

    return {
      isSuccess: true,
      message: 'Notification preference updated successfully',
      data: updatedPreference,
    }
  } catch (error) {
    console.error('Error updating notification preference:', error)
    return { isSuccess: false, message: 'Failed to update notification preference' }
  }
}

export async function updateGlobalNotificationSettings(
  notificationsEnabled: boolean,
  emailNotificationsEnabled: boolean,
  pushNotificationsEnabled: boolean,
): Promise<ActionState<void>> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    await db
      .update(profilesTable)
      .set({
        notificationsEnabled,
        emailNotificationsEnabled,
        pushNotificationsEnabled,
      })
      .where(eq(profilesTable.userId, userId))

    return {
      isSuccess: true,
      message: 'Global notification settings updated successfully',
      data: undefined,
    }
  } catch (error) {
    console.error('Error updating global notification settings:', error)
    return { isSuccess: false, message: 'Failed to update global notification settings' }
  }
}

// Helper functions for creating specific notification types
export async function createRiddleNotification(
  userId: string,
  event: NotificationEvent,
  riddleTitle: string,
  metadata?: Record<string, unknown>,
): Promise<ActionState<SelectNotification | null>> {
  const eventTitles: Record<string, string> = {
    riddle_created: 'New Riddle Created',
    riddle_solved: 'Riddle Solved!',
    riddle_failed: 'Riddle Attempt',
    daily_riddle_available: 'Daily Riddle Available',
  }

  const eventMessages: Record<string, string> = {
    riddle_created: `A new riddle "${riddleTitle}" has been created`,
    riddle_solved: `You solved the riddle "${riddleTitle}"!`,
    riddle_failed: `You attempted the riddle "${riddleTitle}"`,
    daily_riddle_available: `Today's riddle "${riddleTitle}" is now available`,
  }

  return createNotificationWithPreferences(
    userId,
    'riddle',
    event,
    eventTitles[event] || 'Riddle Update',
    eventMessages[event] || `Update about riddle "${riddleTitle}"`,
    metadata,
  )
}

export async function createTeamNotification(
  userId: string,
  event: NotificationEvent,
  teamName: string,
  metadata?: Record<string, unknown>,
): Promise<ActionState<SelectNotification | null>> {
  const eventTitles: Record<string, string> = {
    team_joined: 'Team Joined',
    team_left: 'Team Left',
    team_riddle_created: 'Team Riddle Created',
    team_member_joined: 'New Team Member',
    team_member_left: 'Team Member Left',
    team_join_request: 'Team Join Request',
    team_request_approved: 'Request Approved',
    team_request_rejected: 'Request Rejected',
  }

  const eventMessages: Record<string, string> = {
    team_joined: `You joined the team "${teamName}"`,
    team_left: `You left the team "${teamName}"`,
    team_riddle_created: `A new riddle was created for team "${teamName}"`,
    team_member_joined: `Someone joined your team "${teamName}"`,
    team_member_left: `Someone left your team "${teamName}"`,
    team_join_request: `Someone requested to join your team "${teamName}"`,
    team_request_approved: `Your request to join "${teamName}" was approved`,
    team_request_rejected: `Your request to join "${teamName}" was rejected`,
  }

  return createNotificationWithPreferences(
    userId,
    'team',
    event,
    eventTitles[event] || 'Team Update',
    eventMessages[event] || `Update about team "${teamName}"`,
    metadata,
  )
}

export async function createAchievementNotification(
  userId: string,
  event: NotificationEvent,
  achievementName: string,
  metadata?: Record<string, unknown>,
): Promise<ActionState<SelectNotification | null>> {
  const eventTitles: Record<string, string> = {
    streak_milestone: 'Streak Milestone!',
    points_milestone: 'Points Milestone!',
    level_up: 'Level Up!',
    badge_earned: 'Badge Earned!',
    leaderboard_position: 'Leaderboard Update',
  }

  const eventMessages: Record<string, string> = {
    streak_milestone: `You reached a ${achievementName} streak!`,
    points_milestone: `You earned ${achievementName} points!`,
    level_up: `You leveled up to ${achievementName}!`,
    badge_earned: `You earned the "${achievementName}" badge!`,
    leaderboard_position: `You reached ${achievementName} on the leaderboard!`,
  }

  return createNotificationWithPreferences(
    userId,
    'achievement',
    event,
    eventTitles[event] || 'Achievement Unlocked',
    eventMessages[event] || `You achieved: ${achievementName}`,
    metadata,
  )
}

export async function createSystemNotification(
  userId: string,
  event: NotificationEvent,
  title: string,
  message: string,
  metadata?: Record<string, unknown>,
): Promise<ActionState<SelectNotification | null>> {
  return createNotificationWithPreferences(userId, 'system', event, title, message, metadata)
}

export async function createAdminNotification(
  userId: string,
  title: string,
  message: string,
  metadata?: Record<string, unknown>,
): Promise<ActionState<SelectNotification | null>> {
  return createNotificationWithPreferences(
    userId,
    'admin',
    'announcement',
    title,
    message,
    metadata,
  )
}
