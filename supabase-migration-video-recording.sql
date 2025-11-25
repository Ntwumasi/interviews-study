-- Migration: Add Video Recording Support
-- Date: 2025-11-25
-- Description: Adds columns to store Mux video recording data for interview playback

-- ============================================
-- STEP 1: Add video recording columns to interviews table
-- ============================================

-- Mux playback ID for streaming the video
ALTER TABLE interviews
ADD COLUMN IF NOT EXISTS video_playback_id text;

-- Mux asset ID for managing the video
ALTER TABLE interviews
ADD COLUMN IF NOT EXISTS video_asset_id text;

-- Video duration in seconds
ALTER TABLE interviews
ADD COLUMN IF NOT EXISTS video_duration numeric;

-- Video processing status: 'uploading', 'processing', 'ready', 'error'
ALTER TABLE interviews
ADD COLUMN IF NOT EXISTS video_status text DEFAULT NULL;

-- Timestamp markers for transcript sync (stored as JSON array)
-- Format: [{ "timestamp": 0, "messageIndex": 0 }, ...]
ALTER TABLE interviews
ADD COLUMN IF NOT EXISTS video_timestamps jsonb;

-- ============================================
-- STEP 2: Add comments for documentation
-- ============================================

COMMENT ON COLUMN interviews.video_playback_id IS 'Mux playback ID for streaming the recorded interview video';
COMMENT ON COLUMN interviews.video_asset_id IS 'Mux asset ID for video management and deletion';
COMMENT ON COLUMN interviews.video_duration IS 'Duration of the video recording in seconds';
COMMENT ON COLUMN interviews.video_status IS 'Video processing status: uploading, processing, ready, error';
COMMENT ON COLUMN interviews.video_timestamps IS 'JSON array of timestamp markers for transcript synchronization';

-- ============================================
-- STEP 3: Create index for quick lookups
-- ============================================

CREATE INDEX IF NOT EXISTS idx_interviews_video_status
ON interviews(video_status)
WHERE video_status IS NOT NULL;

-- ============================================
-- STEP 4: Update the video_recording_url column type if needed
-- ============================================

-- The existing video_recording_url column will now store the Mux playback ID
-- We'll keep it for backwards compatibility but add the new columns for clarity

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Uncomment to verify the migration

-- Check new columns exist
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'interviews'
-- AND column_name IN ('video_playback_id', 'video_asset_id', 'video_duration', 'video_status', 'video_timestamps');

-- Check for interviews with video recordings
-- SELECT id, video_status, video_duration, video_playback_id
-- FROM interviews
-- WHERE video_status IS NOT NULL;
