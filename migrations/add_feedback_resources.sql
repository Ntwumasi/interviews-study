-- Migration: Add recommended_resources and next_steps columns to feedback table
-- Run this in your Supabase SQL Editor

-- Add recommended_resources column (JSONB array of resource objects)
ALTER TABLE feedback
ADD COLUMN IF NOT EXISTS recommended_resources JSONB DEFAULT '[]'::jsonb;

-- Add next_steps column (text array for action items)
ALTER TABLE feedback
ADD COLUMN IF NOT EXISTS next_steps TEXT[] DEFAULT '{}';

-- Add comments for documentation
COMMENT ON COLUMN feedback.recommended_resources IS 'Array of resource objects: {type, title, url, description}';
COMMENT ON COLUMN feedback.next_steps IS 'Array of actionable next steps for the candidate';

-- Verify the changes
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'feedback'
ORDER BY ordinal_position;
