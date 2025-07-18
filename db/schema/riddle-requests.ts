/*
<ai_context>
Defines the database schema for riddle creation requests.
Allows non-team members to request riddle creation for teams.
</ai_context>
*/

import { integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

// Enums
export const riddleRequestStatusEnum = pgEnum('riddle_request_status', [
  'pending',
  'approved',
  'rejected',
])
export const riddleCategoryEnum = pgEnum('riddle_category', [
  'logic',
  'math',
  'wordplay',
  'trivia',
  'visual',
])
export const riddleDifficultyEnum = pgEnum('riddle_difficulty', [
  'easy',
  'medium',
  'hard',
  'expert',
])
export const riddleAnswerTypeEnum = pgEnum('riddle_answer_type', [
  'text',
  'number',
  'boolean',
  'multiple_choice',
])

// Riddle creation requests table
export const riddleRequestsTable = pgTable('riddle_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').notNull(), // references teams.id
  requesterId: text('requester_id').notNull(), // references profiles.user_id
  title: text('title').notNull(),
  description: text('description'),
  question: text('question').notNull(),
  category: riddleCategoryEnum('category').notNull(),
  difficulty: riddleDifficultyEnum('difficulty').notNull(),
  answerType: riddleAnswerTypeEnum('answer_type').notNull(),
  correctAnswer: text('correct_answer').notNull(),
  multipleChoiceOptions: text('multiple_choice_options'), // JSON string
  imageUrl: text('image_url'),
  availableHours: integer('available_hours').default(24).notNull(),
  status: riddleRequestStatusEnum('status').default('pending').notNull(),
  requestedAt: timestamp('requested_at').defaultNow().notNull(),
  reviewedAt: timestamp('reviewed_at'),
  reviewedBy: text('reviewed_by'), // references profiles.user_id
  rejectionReason: text('rejection_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})

// Type exports
export type InsertRiddleRequest = typeof riddleRequestsTable.$inferInsert
export type SelectRiddleRequest = typeof riddleRequestsTable.$inferSelect
