/*
<ai_context>
Database schema for the notification system in Riddlix.
Defines notifications table, notification types, and related enums.
</ai_context>
*/

import { boolean, json, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

// Notification type enum for categorizing notifications
export const notificationTypeEnum = pgEnum('notification_type', [
  'riddle',
  'team',
  'achievement',
  'admin',
  'system',
])

// Notification event enum for specific events
export const notificationEventEnum = pgEnum('notification_event', [
  // Riddle events
  'riddle_created',
  'riddle_solved',
  'riddle_failed',
  'daily_riddle_available',
  'riddle_request',
  'riddle_request_approved',
  'riddle_request_rejected',

  // Team events
  'team_joined',
  'team_left',
  'team_riddle_created',
  'team_member_joined',
  'team_member_left',
  'team_join_request',
  'team_request_approved',
  'team_request_rejected',

  // Achievement events
  'streak_milestone',
  'points_milestone',
  'level_up',
  'badge_earned',
  'leaderboard_position',

  // Admin events
  'announcement',

  // System events
  'maintenance',
  'feature_update',
  'welcome',
  'account_updated',
])

// Main notifications table
export const notificationsTable = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  type: notificationTypeEnum('type').notNull(),
  event: notificationEventEnum('event').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  metadata: json('metadata'), // Additional data (riddle_id, team_id, etc.)
  read: boolean('read').default(false).notNull(),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})

// Notification preferences table for user customization
export const notificationPreferencesTable = pgTable('notification_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  notificationType: notificationTypeEnum('notification_type').notNull(),
  notificationEvent: notificationEventEnum('notification_event').notNull(),
  enabled: boolean('enabled').default(true).notNull(),
  emailEnabled: boolean('email_enabled').default(false).notNull(),
  pushEnabled: boolean('push_enabled').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})

// Type exports
export type InsertNotification = typeof notificationsTable.$inferInsert
export type SelectNotification = typeof notificationsTable.$inferSelect
export type InsertNotificationPreference = typeof notificationPreferencesTable.$inferInsert
export type SelectNotificationPreference = typeof notificationPreferencesTable.$inferSelect

// Notification types for TypeScript
export type NotificationType = (typeof notificationTypeEnum.enumValues)[number]
export type NotificationEvent = (typeof notificationEventEnum.enumValues)[number]
