/*
  # Create notifications system

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `title` (text)
      - `message` (text)
      - `type` (enum: medication, journal, therapy, payment, admin, system)
      - `is_read` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `notifications` table
    - Users can only read their own notifications
    - Admins can create notifications for any user
    - System can create notifications
*/

-- Create enum for notification types
CREATE TYPE notification_type AS ENUM ('medication', 'journal', 'therapy', 'payment', 'admin', 'system');

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type notification_type NOT NULL DEFAULT 'system',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own notifications
CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Admins can create notifications for any user
CREATE POLICY "Admins can create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: System can create notifications (for triggers)
CREATE POLICY "System can create notifications"
  ON notifications
  FOR INSERT
  TO service_role
  WITH CHECK (true);