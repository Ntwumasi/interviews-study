-- Rollback Migration: Remove interview types support
-- WARNING: This will remove data! Use with caution.
-- Date: 2025-11-11

-- ============================================
-- Remove new columns from interviews table
-- ============================================
ALTER TABLE interviews
DROP COLUMN IF EXISTS code_submission,
DROP COLUMN IF EXISTS star_responses,
DROP COLUMN IF EXISTS video_recording_url;

-- ============================================
-- Remove interview_type columns
-- ============================================
ALTER TABLE interviews
DROP COLUMN IF EXISTS interview_type;

ALTER TABLE scenarios
DROP COLUMN IF EXISTS interview_type;

-- ============================================
-- Drop the ENUM type (only if not in use)
-- ============================================
DROP TYPE IF EXISTS interview_type CASCADE;

-- ============================================
-- Remove indexes
-- ============================================
DROP INDEX IF EXISTS idx_scenarios_interview_type;
DROP INDEX IF EXISTS idx_interviews_interview_type;
DROP INDEX IF EXISTS idx_interviews_user_type;

-- Note: You may want to remove the new scenario records manually
-- DELETE FROM scenarios WHERE interview_type IN ('coding', 'behavioral');
