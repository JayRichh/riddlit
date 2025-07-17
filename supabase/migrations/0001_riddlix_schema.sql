-- Riddlix MVP Database Schema Migration
-- This migration adds all tables and functionality for the riddle game system

-- Create new enums
CREATE TYPE "public"."team_role" AS ENUM('owner', 'member');--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."riddle_category" AS ENUM('logic', 'math', 'wordplay', 'trivia', 'visual');--> statement-breakpoint
CREATE TYPE "public"."riddle_difficulty" AS ENUM('easy', 'medium', 'hard', 'expert');--> statement-breakpoint
CREATE TYPE "public"."riddle_status" AS ENUM('draft', 'suggested', 'approved', 'scheduled', 'active', 'completed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."answer_type" AS ENUM('text', 'number', 'boolean', 'multiple_choice');--> statement-breakpoint

-- Add new columns to profiles table
ALTER TABLE "profiles" ADD COLUMN "display_name" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "avatar_url" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "total_points" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "riddles_solved" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "current_streak" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "longest_streak" integer DEFAULT 0 NOT NULL;--> statement-breakpoint

-- Create teams table
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
);--> statement-breakpoint

-- Create team memberships table
CREATE TABLE "team_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"role" "team_role" NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "team_memberships_team_user_unique" UNIQUE("team_id", "user_id")
);--> statement-breakpoint

-- Create team join requests table
CREATE TABLE "team_join_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"status" "request_status" DEFAULT 'pending' NOT NULL,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp,
	"reviewed_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "team_join_requests_team_user_unique" UNIQUE("team_id", "user_id")
);--> statement-breakpoint

-- Create riddles table
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
);--> statement-breakpoint

-- Create riddle responses table
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
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "riddle_responses_riddle_user_unique" UNIQUE("riddle_id", "user_id")
);--> statement-breakpoint

-- Add foreign key constraints
ALTER TABLE "team_memberships" ADD CONSTRAINT "team_memberships_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "team_join_requests" ADD CONSTRAINT "team_join_requests_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "riddle_responses" ADD CONSTRAINT "riddle_responses_riddle_id_fkey" FOREIGN KEY ("riddle_id") REFERENCES "riddles"("id") ON DELETE CASCADE;--> statement-breakpoint

-- Add check constraints
ALTER TABLE "riddles" ADD CONSTRAINT "riddles_available_window_check" CHECK ("available_from" < "available_until");--> statement-breakpoint
ALTER TABLE "riddles" ADD CONSTRAINT "riddles_base_points_check" CHECK ("base_points" > 0);--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_max_members_check" CHECK ("max_members" > 0);--> statement-breakpoint

-- Create indexes for performance
CREATE INDEX "idx_teams_public" ON "teams"("is_public", "name") WHERE "is_public" = true;--> statement-breakpoint
CREATE INDEX "idx_teams_owner" ON "teams"("owner_id");--> statement-breakpoint
CREATE INDEX "idx_team_memberships_team" ON "team_memberships"("team_id");--> statement-breakpoint
CREATE INDEX "idx_team_memberships_user" ON "team_memberships"("user_id");--> statement-breakpoint
CREATE INDEX "idx_team_join_requests_team_status" ON "team_join_requests"("team_id", "status");--> statement-breakpoint
CREATE INDEX "idx_riddles_team_active" ON "riddles"("team_id", "status") WHERE "status" = 'active';--> statement-breakpoint
CREATE INDEX "idx_riddles_available_window" ON "riddles"("available_from", "available_until");--> statement-breakpoint
CREATE INDEX "idx_riddles_category_difficulty" ON "riddles"("category", "difficulty");--> statement-breakpoint
CREATE INDEX "idx_riddles_status" ON "riddles"("status");--> statement-breakpoint
CREATE INDEX "idx_riddle_responses_user_recent" ON "riddle_responses"("user_id", "submitted_at" DESC);--> statement-breakpoint
CREATE INDEX "idx_riddle_responses_riddle" ON "riddle_responses"("riddle_id");--> statement-breakpoint
CREATE INDEX "idx_profiles_leaderboard" ON "profiles"("total_points" DESC);--> statement-breakpoint

-- Create function to check team size limits
CREATE OR REPLACE FUNCTION check_team_size()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM team_memberships WHERE team_id = NEW.team_id) >= 
     (SELECT max_members FROM teams WHERE id = NEW.team_id) THEN
    RAISE EXCEPTION 'Team is full';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint

-- Create trigger for team size check
CREATE TRIGGER team_size_check
  BEFORE INSERT ON team_memberships
  FOR EACH ROW EXECUTE FUNCTION check_team_size();--> statement-breakpoint

-- Create function to validate riddle response submission window
CREATE OR REPLACE FUNCTION validate_submission_window()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.submitted_at < (SELECT available_from FROM riddles WHERE id = NEW.riddle_id) OR
     NEW.submitted_at > (SELECT available_until FROM riddles WHERE id = NEW.riddle_id) THEN
    RAISE EXCEPTION 'Response submitted outside of riddle availability window';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint

-- Create trigger for submission window validation
CREATE TRIGGER submission_window_check
  BEFORE INSERT ON riddle_responses
  FOR EACH ROW EXECUTE FUNCTION validate_submission_window();--> statement-breakpoint

-- Create function to update profile stats on riddle completion
CREATE OR REPLACE FUNCTION update_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_correct = true THEN
    UPDATE profiles 
    SET 
      total_points = total_points + NEW.points_earned,
      riddles_solved = riddles_solved + 1,
      current_streak = current_streak + 1,
      longest_streak = GREATEST(longest_streak, current_streak + 1),
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
  ELSE
    UPDATE profiles 
    SET 
      current_streak = 0,
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint

-- Create trigger for profile stats update
CREATE TRIGGER profile_stats_update
  AFTER INSERT ON riddle_responses
  FOR EACH ROW EXECUTE FUNCTION update_profile_stats();--> statement-breakpoint