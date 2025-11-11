-- Quick Reference: Essential SQL Commands
-- Copy-paste these into Supabase SQL Editor
-- For full migration with safety checks, use supabase-migration-interview-types.sql

-- 1. Create ENUM type
CREATE TYPE interview_type AS ENUM ('coding', 'system_design', 'behavioral');

-- 2. Update scenarios table
ALTER TABLE scenarios ADD COLUMN interview_type interview_type DEFAULT 'system_design' NOT NULL;

-- 3. Update interviews table
ALTER TABLE interviews
ADD COLUMN interview_type interview_type,
ADD COLUMN code_submission jsonb,
ADD COLUMN star_responses jsonb,
ADD COLUMN video_recording_url text;

-- 4. Add 'easy' difficulty if it doesn't exist
-- ALTER TYPE difficulty ADD VALUE 'easy';  -- Uncomment if needed

-- 5. Insert sample coding scenario
INSERT INTO scenarios (interview_type, title, description, difficulty, tags, prompt, duration_minutes)
VALUES (
  'coding',
  'Two Sum Problem',
  'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
  'medium',
  ARRAY['arrays', 'hash-table', 'two-pointers'],
  'Solve the Two Sum problem. Example: Input: nums = [2,7,11,15], target = 9, Output: [0,1]',
  60
);

-- 6. Insert sample behavioral scenario
INSERT INTO scenarios (interview_type, title, description, difficulty, tags, prompt, duration_minutes)
VALUES (
  'behavioral',
  'Tell me about a time you failed',
  'Describe a significant professional failure or setback.',
  'medium',
  ARRAY['self-awareness', 'growth-mindset', 'resilience'],
  'Tell me about a time you failed. Use STAR format: Situation, Task, Action, Result.',
  30
);

-- 7. Create indexes
CREATE INDEX idx_scenarios_interview_type ON scenarios(interview_type);
CREATE INDEX idx_interviews_interview_type ON interviews(interview_type);
CREATE INDEX idx_interviews_user_type ON interviews(user_id, interview_type);

-- Verify
SELECT interview_type, COUNT(*) FROM scenarios GROUP BY interview_type;
