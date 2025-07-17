/*
<ai_context>
Defines the database schema for riddles and riddle responses.
Core functionality for the riddle game including categories, difficulties, and time-based availability.
</ai_context>
*/

import { boolean, integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

// Enums
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
export const riddleStatusEnum = pgEnum('riddle_status', [
  'draft',
  'suggested',
  'approved',
  'scheduled',
  'active',
  'completed',
  'archived',
])
export const answerTypeEnum = pgEnum('answer_type', [
  'text',
  'number',
  'boolean',
  'multiple_choice',
])

// Riddles table
export const riddlesTable = pgTable('riddles', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description'),
  question: text('question').notNull(),
  imageUrl: text('image_url'),

  // Answer configuration
  answerType: answerTypeEnum('answer_type').notNull(),
  correctAnswer: text('correct_answer').notNull(), // JSON string for flexibility
  multipleChoiceOptions: text('multiple_choice_options'), // JSON array for MC questions

  // Metadata
  category: riddleCategoryEnum('category').notNull(),
  difficulty: riddleDifficultyEnum('difficulty').notNull(),
  basePoints: integer('base_points').notNull(), // 10=easy, 20=medium, 30=hard, 50=expert

  // Scheduling
  availableFrom: timestamp('available_from').notNull(),
  availableUntil: timestamp('available_until').notNull(),
  timezone: text('timezone').default('UTC').notNull(),

  // Status and ownership
  status: riddleStatusEnum('status').default('draft').notNull(),
  createdBy: text('created_by').notNull(), // references profiles.user_id
  suggestedBy: text('suggested_by'), // references profiles.user_id for user suggestions
  approvedBy: text('approved_by'), // references profiles.user_id
  rejectionReason: text('rejection_reason'),

  // Team assignment
  teamId: uuid('team_id'), // references teams.id, nullable for global riddles

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})

// Riddle responses table
export const riddleResponsesTable = pgTable('riddle_responses', {
  id: uuid('id').defaultRandom().primaryKey(),
  riddleId: uuid('riddle_id')
    .references(() => riddlesTable.id, { onDelete: 'cascade' })
    .notNull(),
  userId: text('user_id').notNull(), // references profiles.user_id
  teamId: uuid('team_id'), // references teams.id, nullable

  // Response data
  answer: text('answer').notNull(), // JSON string for flexibility
  isCorrect: boolean('is_correct').notNull(), // auto-calculated on submission
  pointsEarned: integer('points_earned').notNull(), // auto-calculated

  // Timing
  submittedAt: timestamp('submitted_at').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})

// Type exports
export type InsertRiddle = typeof riddlesTable.$inferInsert
export type SelectRiddle = typeof riddlesTable.$inferSelect

export type InsertRiddleResponse = typeof riddleResponsesTable.$inferInsert
export type SelectRiddleResponse = typeof riddleResponsesTable.$inferSelect
