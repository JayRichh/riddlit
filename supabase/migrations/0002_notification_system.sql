-- Notification System Migration
-- This migration adds the notification system tables and functionality

-- Create notification type enum
CREATE TYPE "public"."notification_type" AS ENUM('riddle', 'team', 'achievement', 'admin', 'system');--> statement-breakpoint

-- Create notification event enum  
CREATE TYPE "public"."notification_event" AS ENUM('riddle_created', 'riddle_solved', 'riddle_failed', 'daily_riddle_available', 'team_joined', 'team_left', 'team_riddle_created', 'team_member_joined', 'team_member_left', 'team_join_request', 'team_request_approved', 'team_request_rejected', 'streak_milestone', 'points_milestone', 'level_up', 'badge_earned', 'leaderboard_position', 'announcement', 'maintenance', 'feature_update', 'welcome', 'account_updated');--> statement-breakpoint

-- Add notification preferences to profiles table
ALTER TABLE "profiles" ADD COLUMN "notifications_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "email_notifications_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "push_notifications_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint

-- Create notifications table
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"event" "notification_event" NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"metadata" jsonb,
	"read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

-- Create notification preferences table  
CREATE TABLE "notification_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"notification_type" "notification_type" NOT NULL,
	"notification_event" "notification_event" NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"email_enabled" boolean DEFAULT false NOT NULL,
	"push_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notification_preferences_user_type_event_unique" UNIQUE("user_id", "notification_type", "notification_event")
);--> statement-breakpoint

-- Add foreign key constraints
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("user_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("user_id") ON DELETE CASCADE;--> statement-breakpoint

-- Create indexes for performance
CREATE INDEX "idx_notifications_user_unread" ON "notifications"("user_id", "read") WHERE "read" = false;--> statement-breakpoint
CREATE INDEX "idx_notifications_user_recent" ON "notifications"("user_id", "created_at" DESC);--> statement-breakpoint
CREATE INDEX "idx_notifications_type_event" ON "notifications"("type", "event");--> statement-breakpoint
CREATE INDEX "idx_notification_preferences_user" ON "notification_preferences"("user_id");--> statement-breakpoint
CREATE INDEX "idx_notification_preferences_type_event" ON "notification_preferences"("notification_type", "notification_event");--> statement-breakpoint

-- Create function to clean up old notifications (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications 
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint

-- Create function to get unread notification count for a user
CREATE OR REPLACE FUNCTION get_unread_count(user_id_param text)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer 
    FROM notifications 
    WHERE user_id = user_id_param AND read = false
  );
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint

-- Create function to mark notifications as read
CREATE OR REPLACE FUNCTION mark_notifications_read(user_id_param text, notification_ids uuid[] DEFAULT NULL)
RETURNS void AS $$
BEGIN
  IF notification_ids IS NULL THEN
    -- Mark all notifications as read for the user
    UPDATE notifications 
    SET read = true, read_at = NOW(), updated_at = NOW()
    WHERE user_id = user_id_param AND read = false;
  ELSE
    -- Mark specific notifications as read
    UPDATE notifications 
    SET read = true, read_at = NOW(), updated_at = NOW()
    WHERE user_id = user_id_param AND id = ANY(notification_ids) AND read = false;
  END IF;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint

-- Create function to create notification with preference checking
CREATE OR REPLACE FUNCTION create_notification_with_preferences(
  user_id_param text,
  type_param notification_type,
  event_param notification_event,
  title_param text,
  message_param text,
  metadata_param jsonb DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  notification_id uuid;
  pref_enabled boolean;
  global_enabled boolean;
BEGIN
  -- Check if user has global notifications enabled
  SELECT notifications_enabled INTO global_enabled
  FROM profiles 
  WHERE user_id = user_id_param;
  
  IF global_enabled IS FALSE THEN
    RETURN NULL;
  END IF;
  
  -- Check if user has this specific notification type/event enabled
  SELECT enabled INTO pref_enabled
  FROM notification_preferences 
  WHERE user_id = user_id_param 
    AND notification_type = type_param 
    AND notification_event = event_param;
  
  -- If no specific preference exists, default to enabled
  IF pref_enabled IS NULL THEN
    pref_enabled := true;
  END IF;
  
  -- Only create notification if enabled
  IF pref_enabled = true THEN
    INSERT INTO notifications (user_id, type, event, title, message, metadata)
    VALUES (user_id_param, type_param, event_param, title_param, message_param, metadata_param)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint

-- Create trigger function to update notification updated_at timestamp
CREATE OR REPLACE FUNCTION update_notification_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint

-- Create trigger for notification updates
CREATE TRIGGER notification_update_timestamp
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_notification_timestamp();--> statement-breakpoint

-- Create trigger for notification preferences updates
CREATE TRIGGER notification_preferences_update_timestamp
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_notification_timestamp();--> statement-breakpoint