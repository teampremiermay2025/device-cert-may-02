/*
  # Device Certification System Schema

  1. New Tables
    - `certification_requests`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `stage` (text)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `created_by` (uuid, references auth.users)

    - `tasks`
      - `id` (uuid, primary key)
      - `certification_id` (uuid, references certification_requests)
      - `title` (text)
      - `description` (text)
      - `assignee` (uuid, references auth.users)
      - `priority` (text)
      - `status` (text)
      - `due_date` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `task_comments`
      - `id` (uuid, primary key)
      - `task_id` (uuid, references tasks)
      - `user_id` (uuid, references auth.users)
      - `content` (text)
      - `created_at` (timestamptz)

    - `task_attachments`
      - `id` (uuid, primary key)
      - `task_id` (uuid, references tasks)
      - `file_name` (text)
      - `file_type` (text)
      - `file_size` (bigint)
      - `file_path` (text)
      - `uploaded_by` (uuid, references auth.users)
      - `uploaded_at` (timestamptz)

    - `task_time_logs`
      - `id` (uuid, primary key)
      - `task_id` (uuid, references tasks)
      - `user_id` (uuid, references auth.users)
      - `duration` (interval)
      - `description` (text)
      - `logged_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create enum types for fixed values
CREATE TYPE certification_stage AS ENUM (
  'FORECAST', 'PLANNING', 'SUBMITTED', 'SUBMISSION_REVIEW',
  'DEVICE_ENTRY', 'DEVICE_TESTING', 'TAQ_REVIEW', 'TA_COMPLETE', 'CLOSED'
);

CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE task_status AS ENUM ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE');

-- Create certification_requests table
CREATE TABLE certification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  stage certification_stage NOT NULL DEFAULT 'FORECAST',
  status text NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid NOT NULL REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create tasks table
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certification_id uuid NOT NULL REFERENCES certification_requests(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  assignee uuid REFERENCES auth.users(id),
  priority task_priority NOT NULL DEFAULT 'MEDIUM',
  status task_status NOT NULL DEFAULT 'TODO',
  due_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  labels text[] DEFAULT ARRAY[]::text[],
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create task_comments table
CREATE TABLE task_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create task_attachments table
CREATE TABLE task_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL,
  file_path text NOT NULL,
  uploaded_by uuid NOT NULL REFERENCES auth.users(id),
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

-- Create task_time_logs table
CREATE TABLE task_time_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  duration interval NOT NULL,
  description text,
  logged_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE certification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_time_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for certification_requests
CREATE POLICY "Users can view all certification requests"
  ON certification_requests
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create certification requests"
  ON certification_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own certification requests"
  ON certification_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create policies for tasks
CREATE POLICY "Users can view all tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create tasks"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM certification_requests
      WHERE id = certification_id
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update assigned tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (
    assignee = auth.uid() OR
    EXISTS (
      SELECT 1 FROM certification_requests
      WHERE id = certification_id
      AND created_by = auth.uid()
    )
  );

-- Create policies for task_comments
CREATE POLICY "Users can view all comments"
  ON task_comments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comments"
  ON task_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for task_attachments
CREATE POLICY "Users can view all attachments"
  ON task_attachments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can upload attachments"
  ON task_attachments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uploaded_by);

-- Create policies for task_time_logs
CREATE POLICY "Users can view all time logs"
  ON task_time_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create time logs"
  ON task_time_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX idx_certification_requests_created_by ON certification_requests(created_by);
CREATE INDEX idx_tasks_certification_id ON tasks(certification_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee);
CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX idx_task_attachments_task_id ON task_attachments(task_id);
CREATE INDEX idx_task_time_logs_task_id ON task_time_logs(task_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_certification_requests_updated_at
  BEFORE UPDATE ON certification_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();