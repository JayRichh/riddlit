/*
<ai_context>
Defines the database schema for profiles.
Updated: Removed Stripe-related fields
</ai_context>
*/

import { boolean, integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const membershipEnum = pgEnum('membership', ['free', 'pro'])

export const profilesTable = pgTable('profiles', {
  userId: text('user_id').primaryKey().notNull(),
  membership: membershipEnum('membership').notNull().default('free'),

  // Enhanced fields for gamification
  displayName: text('display_name'),
  avatarUrl: text('avatar_url'),
  totalPoints: integer('total_points').default(0).notNull(),
  riddlesSolved: integer('riddles_solved').default(0).notNull(),
  currentStreak: integer('current_streak').default(0).notNull(),
  longestStreak: integer('longest_streak').default(0).notNull(),

  // Global notification settings (specific preferences are in notification_preferences table)
  notificationsEnabled: boolean('notifications_enabled').default(true).notNull(),
  emailNotificationsEnabled: boolean('email_notifications_enabled').default(false).notNull(),
  pushNotificationsEnabled: boolean('push_notifications_enabled').default(false).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})

export type InsertProfile = typeof profilesTable.$inferInsert
export type SelectProfile = typeof profilesTable.$inferSelect
