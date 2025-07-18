CREATE TYPE "public"."notification_event" AS ENUM('riddle_created', 'riddle_solved', 'riddle_failed', 'daily_riddle_available', 'riddle_request', 'riddle_request_approved', 'riddle_request_rejected', 'team_joined', 'team_left', 'team_riddle_created', 'team_member_joined', 'team_member_left', 'team_join_request', 'team_request_approved', 'team_request_rejected', 'streak_milestone', 'points_milestone', 'level_up', 'badge_earned', 'leaderboard_position', 'announcement', 'maintenance', 'feature_update', 'welcome', 'account_updated');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('riddle', 'team', 'achievement', 'admin', 'system');--> statement-breakpoint
CREATE TYPE "public"."riddle_answer_type" AS ENUM('text', 'number', 'boolean', 'multiple_choice');--> statement-breakpoint
CREATE TYPE "public"."riddle_category" AS ENUM('logic', 'math', 'wordplay', 'trivia', 'visual');--> statement-breakpoint
CREATE TYPE "public"."riddle_difficulty" AS ENUM('easy', 'medium', 'hard', 'expert');--> statement-breakpoint
CREATE TYPE "public"."riddle_request_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."answer_type" AS ENUM('text', 'number', 'boolean', 'multiple_choice');--> statement-breakpoint
CREATE TYPE "public"."riddle_status" AS ENUM('draft', 'suggested', 'approved', 'scheduled', 'active', 'completed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."team_role" AS ENUM('owner', 'member');--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"notification_type" "notification_type" NOT NULL,
	"notification_event" "notification_event" NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"email_enabled" boolean DEFAULT false NOT NULL,
	"push_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"event" "notification_event" NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"metadata" json,
	"read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "riddle_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"requester_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"question" text NOT NULL,
	"category" "riddle_category" NOT NULL,
	"difficulty" "riddle_difficulty" NOT NULL,
	"answer_type" "riddle_answer_type" NOT NULL,
	"correct_answer" text NOT NULL,
	"multiple_choice_options" text,
	"image_url" text,
	"available_hours" integer DEFAULT 24 NOT NULL,
	"status" "riddle_request_status" DEFAULT 'pending' NOT NULL,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp,
	"reviewed_by" text,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "riddle_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"riddle_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"team_id" uuid,
	"answer" text NOT NULL,
	"is_correct" boolean NOT NULL,
	"points_earned" integer NOT NULL,
	"submitted_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "riddles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"question" text NOT NULL,
	"image_url" text,
	"answer_type" "answer_type" NOT NULL,
	"correct_answer" text NOT NULL,
	"multiple_choice_options" text,
	"category" "riddle_category" NOT NULL,
	"difficulty" "riddle_difficulty" NOT NULL,
	"base_points" integer NOT NULL,
	"available_from" timestamp NOT NULL,
	"available_until" timestamp NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"status" "riddle_status" DEFAULT 'draft' NOT NULL,
	"created_by" text NOT NULL,
	"suggested_by" text,
	"approved_by" text,
	"rejection_reason" text,
	"team_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "riddles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "team_join_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"status" "request_status" DEFAULT 'pending' NOT NULL,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp,
	"reviewed_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"role" "team_role" NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"owner_id" text NOT NULL,
	"max_members" integer DEFAULT 50 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "teams_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "display_name" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "avatar_url" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "total_points" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "riddles_solved" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "current_streak" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "longest_streak" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "notifications_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "email_notifications_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "push_notifications_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "riddle_responses" ADD CONSTRAINT "riddle_responses_riddle_id_riddles_id_fk" FOREIGN KEY ("riddle_id") REFERENCES "public"."riddles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_join_requests" ADD CONSTRAINT "team_join_requests_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_memberships" ADD CONSTRAINT "team_memberships_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;