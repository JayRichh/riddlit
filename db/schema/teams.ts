/*
<ai_context>
Defines the database schema for teams, team memberships, and team join requests.
Used for organizing users into teams for riddle competitions.
</ai_context>
*/

import { boolean, integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

// Enums
export const teamRoleEnum = pgEnum('team_role', ['owner', 'member'])
export const requestStatusEnum = pgEnum('request_status', ['pending', 'approved', 'rejected'])

// Teams table
export const teamsTable = pgTable('teams', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description'),
  isPublic: boolean('is_public').default(false).notNull(),
  ownerId: text('owner_id').notNull(), // references profiles.user_id
  maxMembers: integer('max_members').default(50).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})

// Team memberships table
export const teamMembershipsTable = pgTable('team_memberships', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id')
    .references(() => teamsTable.id, { onDelete: 'cascade' })
    .notNull(),
  userId: text('user_id').notNull(), // references profiles.user_id
  role: teamRoleEnum('role').notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Team join requests table
export const teamJoinRequestsTable = pgTable('team_join_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id')
    .references(() => teamsTable.id, { onDelete: 'cascade' })
    .notNull(),
  userId: text('user_id').notNull(), // references profiles.user_id
  status: requestStatusEnum('status').default('pending').notNull(),
  requestedAt: timestamp('requested_at').defaultNow().notNull(),
  reviewedAt: timestamp('reviewed_at'),
  reviewedBy: text('reviewed_by'), // references profiles.user_id
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})

// Type exports
export type InsertTeam = typeof teamsTable.$inferInsert
export type SelectTeam = typeof teamsTable.$inferSelect

export type InsertTeamMembership = typeof teamMembershipsTable.$inferInsert
export type SelectTeamMembership = typeof teamMembershipsTable.$inferSelect

export type InsertTeamJoinRequest = typeof teamJoinRequestsTable.$inferInsert
export type SelectTeamJoinRequest = typeof teamJoinRequestsTable.$inferSelect
