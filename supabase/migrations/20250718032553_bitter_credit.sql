/*
  # Create care management tables

  1. New Tables
    - `journal_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `mood` (integer, 1-10 scale)
      - `pain_level` (integer, 1-10 scale)
      - `sleep_hours` (decimal)
      - `notes` (text)
      - `date` (date)
      - `created_at` (timestamp)

    - `assignments`
      - `id` (uuid, primary key)
      - `older_adult_id` (uuid, foreign key)
      - `caregiver_id` (uuid, foreign key, optional)
      - `therapist_id` (uuid, foreign key, optional)
      - `created_at` (timestamp)

    - `care_plans`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `current_goals` (text)
      - `next_appointment` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Users can manage their own data
    - Caregivers/therapists can access assigned clients' data
    - Admins have full access
*/

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mood integer CHECK (mood >= 1 AND mood <= 10),
  pain_level integer CHECK (pain_level >= 1 AND pain_level <= 10),
  sleep_hours decimal(3,1) CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
  notes text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  older_adult_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  caregiver_id uuid REFERENCES users(id) ON DELETE SET NULL,
  therapist_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(older_adult_id)
);

-- Create care_plans table
CREATE TABLE IF NOT EXISTS care_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_goals text,
  next_appointment timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on all tables
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_plans ENABLE ROW LEVEL SECURITY;

-- Journal entries policies
CREATE POLICY "Users can manage own journal entries"
  ON journal_entries
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Caregivers can read assigned clients journal entries"
  ON journal_entries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assignments
      WHERE assignments.older_adult_id = journal_entries.user_id
      AND assignments.caregiver_id = auth.uid()
    )
  );

CREATE POLICY "Therapists can read assigned clients journal entries"
  ON journal_entries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assignments
      WHERE assignments.older_adult_id = journal_entries.user_id
      AND assignments.therapist_id = auth.uid()
    )
  );

-- Assignments policies
CREATE POLICY "Users can read own assignments"
  ON assignments
  FOR SELECT
  TO authenticated
  USING (
    older_adult_id = auth.uid() OR 
    caregiver_id = auth.uid() OR 
    therapist_id = auth.uid()
  );

CREATE POLICY "Admins can manage all assignments"
  ON assignments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Care plans policies
CREATE POLICY "Users can manage own care plans"
  ON care_plans
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Caregivers can read assigned clients care plans"
  ON care_plans
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assignments
      WHERE assignments.older_adult_id = care_plans.user_id
      AND assignments.caregiver_id = auth.uid()
    )
  );

CREATE POLICY "Therapists can manage assigned clients care plans"
  ON care_plans
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assignments
      WHERE assignments.older_adult_id = care_plans.user_id
      AND assignments.therapist_id = auth.uid()
    )
  );