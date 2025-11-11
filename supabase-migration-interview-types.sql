-- Migration: Add support for multiple interview types
-- Date: 2025-11-11
-- Description: Adds interview_type enum and updates schema for coding, system_design, and behavioral interviews

-- ============================================
-- STEP 1: Create ENUM type for interview types
-- ============================================
DO $$ BEGIN
    CREATE TYPE interview_type AS ENUM ('coding', 'system_design', 'behavioral');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- STEP 2: Add interview_type to scenarios table
-- ============================================
ALTER TABLE scenarios
ADD COLUMN IF NOT EXISTS interview_type interview_type DEFAULT 'system_design';

-- Update existing scenarios to be system_design
UPDATE scenarios
SET interview_type = 'system_design'
WHERE interview_type IS NULL;

-- Make interview_type NOT NULL after setting defaults
ALTER TABLE scenarios
ALTER COLUMN interview_type SET NOT NULL;

-- ============================================
-- STEP 3: Add interview_type to interviews table
-- ============================================
ALTER TABLE interviews
ADD COLUMN IF NOT EXISTS interview_type interview_type;

-- Add type-specific data columns to interviews table
ALTER TABLE interviews
ADD COLUMN IF NOT EXISTS code_submission jsonb,
ADD COLUMN IF NOT EXISTS star_responses jsonb,
ADD COLUMN IF NOT EXISTS video_recording_url text;

-- Add comments for clarity
COMMENT ON COLUMN interviews.code_submission IS 'Code + test results for coding interviews';
COMMENT ON COLUMN interviews.star_responses IS 'Structured STAR responses for behavioral interviews';
COMMENT ON COLUMN interviews.video_recording_url IS 'URL to recorded video for all interview types';

-- ============================================
-- STEP 4: Update difficulty enum if needed
-- ============================================
DO $$ BEGIN
    -- Check if 'easy' exists in difficulty type
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'difficulty' AND e.enumlabel = 'easy'
    ) THEN
        ALTER TYPE difficulty ADD VALUE 'easy';
    END IF;
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

-- ============================================
-- STEP 5: Insert sample scenarios for new interview types
-- ============================================

-- Insert LeetCode Coding Scenario
INSERT INTO scenarios (
    interview_type,
    title,
    description,
    difficulty,
    tags,
    prompt,
    duration_minutes
) VALUES (
    'coding',
    'Two Sum Problem',
    'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    'medium',
    ARRAY['arrays', 'hash-table', 'two-pointers'],
    'Solve the Two Sum problem. Explain your approach, write clean code, and analyze the time and space complexity.

Example:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

Constraints:
- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists.

Start by discussing your approach with the interviewer before coding.',
    60
) ON CONFLICT DO NOTHING;

-- Insert Behavioral Scenario
INSERT INTO scenarios (
    interview_type,
    title,
    description,
    difficulty,
    tags,
    prompt,
    duration_minutes
) VALUES (
    'behavioral',
    'Tell me about a time you failed',
    'Describe a significant professional failure or setback. Focus on what you learned and how you grew from the experience.',
    'medium',
    ARRAY['self-awareness', 'growth-mindset', 'resilience'],
    'Tell me about a time you failed at work or on a project.

Use the STAR format to structure your response:
- Situation: What was the context?
- Task: What were you responsible for?
- Action: What did you do?
- Result: What was the outcome?

The interviewer will be evaluating:
- Your self-awareness and ability to reflect
- How you handle setbacks
- What you learned from the experience
- Evidence of growth and improvement
- Your communication clarity

Be specific with examples and metrics where possible. Focus on learnings and how you applied them later.',
    30
) ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 6: Create indexes for better query performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_scenarios_interview_type
ON scenarios(interview_type);

CREATE INDEX IF NOT EXISTS idx_interviews_interview_type
ON interviews(interview_type);

CREATE INDEX IF NOT EXISTS idx_interviews_user_type
ON interviews(user_id, interview_type);

-- ============================================
-- STEP 7: Update RLS policies if needed
-- ============================================
-- Note: Adjust these based on your existing RLS setup

-- Allow users to view scenarios of all types
DROP POLICY IF EXISTS "Users can view all scenarios" ON scenarios;
CREATE POLICY "Users can view all scenarios"
ON scenarios FOR SELECT
USING (true);

-- Users can only view their own interviews
DROP POLICY IF EXISTS "Users can view own interviews" ON interviews;
CREATE POLICY "Users can view own interviews"
ON interviews FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own interviews
DROP POLICY IF EXISTS "Users can insert own interviews" ON interviews;
CREATE POLICY "Users can insert own interviews"
ON interviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own interviews
DROP POLICY IF EXISTS "Users can update own interviews" ON interviews;
CREATE POLICY "Users can update own interviews"
ON interviews FOR UPDATE
USING (auth.uid() = user_id);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Uncomment to verify the migration

-- Check interview types in scenarios
-- SELECT interview_type, COUNT(*) as count
-- FROM scenarios
-- GROUP BY interview_type;

-- Check new columns exist
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'interviews'
-- AND column_name IN ('interview_type', 'code_submission', 'star_responses', 'video_recording_url');

-- View all scenarios
-- SELECT id, interview_type, title, difficulty, duration_minutes
-- FROM scenarios
-- ORDER BY interview_type, title;
