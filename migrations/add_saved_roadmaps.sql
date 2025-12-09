-- Migration: Add saved_roadmaps table for storing user roadmaps
-- Run this in your Supabase SQL Editor

-- Create saved_roadmaps table
CREATE TABLE IF NOT EXISTS saved_roadmaps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  level TEXT,
  roadmap_data JSONB NOT NULL,
  job_url TEXT,
  target_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_saved_roadmaps_user_id ON saved_roadmaps(user_id);

-- Add RLS policies
ALTER TABLE saved_roadmaps ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own roadmaps
CREATE POLICY "Users can view own roadmaps"
  ON saved_roadmaps FOR SELECT
  USING (auth.uid()::text = (SELECT clerk_id FROM users WHERE id = user_id));

-- Policy: Users can insert their own roadmaps
CREATE POLICY "Users can insert own roadmaps"
  ON saved_roadmaps FOR INSERT
  WITH CHECK (auth.uid()::text = (SELECT clerk_id FROM users WHERE id = user_id));

-- Policy: Users can delete their own roadmaps
CREATE POLICY "Users can delete own roadmaps"
  ON saved_roadmaps FOR DELETE
  USING (auth.uid()::text = (SELECT clerk_id FROM users WHERE id = user_id));

-- Verify the table was created
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'saved_roadmaps'
ORDER BY ordinal_position;
