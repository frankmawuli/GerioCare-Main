/*
  # Create users table and authentication setup

  1. New Tables
    - `users`
      - `id` (uuid, primary key, matches auth.users)
      - `email` (text, unique)
      - `role` (enum: older_adult, caregiver, therapist, admin)
      - `first_name` (text)
      - `last_name` (text)
      - `phone` (text, optional)
      - `is_subscribed` (boolean, for older adults)
      - `subscription_expires_at` (timestamp, optional)
      - `assigned_caregiver_id` (uuid, foreign key)
      - `assigned_therapist_id` (uuid, foreign key)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `users` table
    - Add policies for users to read/update their own data
    - Add policies for caregivers/therapists to read assigned clients
    - Add policies for admins to manage all users
*/

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('older_adult', 'caregiver', 'therapist', 'admin');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'older_adult',
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  is_subscribed boolean DEFAULT false,
  subscription_expires_at timestamptz,
  assigned_caregiver_id uuid REFERENCES users(id),
  assigned_therapist_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Policy: Caregivers can read their assigned clients
CREATE POLICY "Caregivers can read assigned clients"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users caregiver
      WHERE caregiver.id = auth.uid()
      AND caregiver.role = 'caregiver'
      AND users.assigned_caregiver_id = caregiver.id
    )
  );

-- Policy: Therapists can read their assigned clients
CREATE POLICY "Therapists can read assigned clients"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users therapist
      WHERE therapist.id = auth.uid()
      AND therapist.role = 'therapist'
      AND users.assigned_therapist_id = therapist.id
    )
  );

-- Policy: Admins can read all users
CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users admin
      WHERE admin.id = auth.uid()
      AND admin.role = 'admin'
    )
  );

-- Policy: Admins can update all users
CREATE POLICY "Admins can update all users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users admin
      WHERE admin.id = auth.uid()
      AND admin.role = 'admin'
    )
  );

-- Policy: Allow user creation during signup
CREATE POLICY "Allow user creation during signup"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);