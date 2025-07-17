'use server'

import { auth } from '@clerk/nextjs/server'
import { and, desc, eq, sql } from 'drizzle-orm'

import { db } from '@/db/db'
import {
  NotificationEvent,
  notificationsTable,
  NotificationType,
  SelectNotification,
} from '@/db/schema/notifications'
import { profilesTable } from '@/db/schema/profiles'
import { ActionState } from '@/lib/types/server-action'

import { createNotification, createNotificationWithPreferences } from './notification-actions'

// Admin-specific notification operations
export async function createSystemAnnouncement(
  title: string,
  message: string,
  targetUserIds?: string[], // If not provided, sends to all users
  metadata?: Record<string, unknown>,
): Promise<ActionState<{ sent: number; failed: number }>> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    // Check if user has admin privileges (you might want to implement proper role checking)
    // For now, this is a placeholder - you should implement actual admin role checking

    let userIds: string[] = []

    if (targetUserIds && targetUserIds.length > 0) {
      userIds = targetUserIds
    } else {
      // Get all user IDs from profiles table
      const profiles = await db.select({ userId: profilesTable.userId }).from(profilesTable)

      userIds = profiles.map((p) => p.userId)
    }

    let sent = 0
    let failed = 0

    // Create notification for each user
    for (const targetUserId of userIds) {
      try {
        const result = await createNotificationWithPreferences(
          targetUserId,
          'admin',
          'announcement',
          title,
          message,
          metadata,
        )

        if (result.isSuccess) {
          sent++
        } else {
          failed++
        }
      } catch {
        failed++
      }
    }

    return {
      isSuccess: true,
      message: `Announcement sent to ${sent} users. ${failed} failed.`,
      data: { sent, failed },
    }
  } catch (error) {
    console.error('Error creating system announcement:', error)
    return { isSuccess: false, message: 'Failed to create system announcement' }
  }
}

export async function createUserNotification(
  targetUserId: string,
  type: NotificationType,
  event: NotificationEvent,
  title: string,
  message: string,
  metadata?: Record<string, unknown>,
): Promise<ActionState<SelectNotification>> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    // Check admin privileges here

    const result = await createNotification(targetUserId, type, event, title, message, metadata)

    return result
  } catch (error) {
    console.error('Error creating user notification:', error)
    return { isSuccess: false, message: 'Failed to create user notification' }
  }
}

export async function getAllNotifications(
  limit: number = 50,
  offset: number = 0,
  searchQuery?: string,
  typeFilter?: NotificationType,
  userIdFilter?: string,
): Promise<ActionState<SelectNotification[]>> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    // Check admin privileges here

    const conditions = []

    if (searchQuery) {
      conditions.push(
        sql`${notificationsTable.title} ILIKE ${`%${searchQuery}%`} OR ${notificationsTable.message} ILIKE ${`%${searchQuery}%`}`,
      )
    }

    if (typeFilter) {
      conditions.push(eq(notificationsTable.type, typeFilter))
    }

    if (userIdFilter) {
      conditions.push(eq(notificationsTable.userId, userIdFilter))
    }

    let notifications: SelectNotification[]

    if (conditions.length > 0) {
      notifications = await db
        .select()
        .from(notificationsTable)
        .where(and(...conditions))
        .orderBy(desc(notificationsTable.createdAt))
        .limit(limit)
        .offset(offset)
    } else {
      notifications = await db
        .select()
        .from(notificationsTable)
        .orderBy(desc(notificationsTable.createdAt))
        .limit(limit)
        .offset(offset)
    }

    return {
      isSuccess: true,
      message: 'Notifications retrieved successfully',
      data: notifications,
    }
  } catch (error) {
    console.error('Error getting all notifications:', error)
    return { isSuccess: false, message: 'Failed to get notifications' }
  }
}

export async function deleteNotificationAdmin(notificationId: string): Promise<ActionState<void>> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    // Check admin privileges here

    await db.delete(notificationsTable).where(eq(notificationsTable.id, notificationId))

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

export async function updateNotificationAdmin(
  notificationId: string,
  title: string,
  message: string,
  metadata?: Record<string, unknown>,
): Promise<ActionState<SelectNotification>> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    // Check admin privileges here

    const [updatedNotification] = await db
      .update(notificationsTable)
      .set({
        title,
        message,
        metadata,
        updatedAt: new Date(),
      })
      .where(eq(notificationsTable.id, notificationId))
      .returning()

    if (!updatedNotification) {
      return { isSuccess: false, message: 'Notification not found' }
    }

    return {
      isSuccess: true,
      message: 'Notification updated successfully',
      data: updatedNotification,
    }
  } catch (error) {
    console.error('Error updating notification:', error)
    return { isSuccess: false, message: 'Failed to update notification' }
  }
}

export async function getNotificationStats(): Promise<
  ActionState<{
    total: number
    unread: number
    byType: Record<NotificationType, number>
  }>
> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    // Check admin privileges here

    const [totalResult] = await db.execute(sql`SELECT COUNT(*) as total FROM ${notificationsTable}`)

    const [unreadResult] = await db.execute(
      sql`SELECT COUNT(*) as unread FROM ${notificationsTable} WHERE read = false`,
    )

    const typeResults = await db.execute(
      sql`SELECT type, COUNT(*) as count FROM ${notificationsTable} GROUP BY type`,
    )

    const byType: Record<NotificationType, number> = {
      riddle: 0,
      team: 0,
      achievement: 0,
      admin: 0,
      system: 0,
    }

    typeResults.forEach((row: Record<string, unknown>) => {
      const type = row.type as NotificationType
      byType[type] = Number(row.count)
    })

    return {
      isSuccess: true,
      message: 'Notification stats retrieved successfully',
      data: {
        total: Number(totalResult.total),
        unread: Number(unreadResult.unread),
        byType,
      },
    }
  } catch (error) {
    console.error('Error getting notification stats:', error)
    return { isSuccess: false, message: 'Failed to get notification stats' }
  }
}

export async function getAllUsers(): Promise<
  ActionState<{ userId: string; displayName?: string }[]>
> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { isSuccess: false, message: 'Authentication required' }
    }

    // Check admin privileges here

    const users = await db
      .select({
        userId: profilesTable.userId,
        displayName: profilesTable.displayName,
      })
      .from(profilesTable)
      .orderBy(profilesTable.displayName)

    return {
      isSuccess: true,
      message: 'Users retrieved successfully',
      data: users.map((user) => ({
        userId: user.userId,
        displayName: user.displayName || undefined,
      })),
    }
  } catch (error) {
    console.error('Error getting users:', error)
    return { isSuccess: false, message: 'Failed to get users' }
  }
}
