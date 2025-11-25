-- Migration: Newsletter Subscribers Table
-- Date: 2025-11-25
-- Description: Creates a table to store newsletter subscribers from the landing page

-- ============================================
-- STEP 1: Create newsletter_subscribers table
-- ============================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text NOT NULL UNIQUE,
    source text DEFAULT 'landing_page',
    subscribed_at timestamp with time zone DEFAULT now(),
    unsubscribed_at timestamp with time zone,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- STEP 2: Create indexes for better performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscribers(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed_at ON newsletter_subscribers(subscribed_at DESC);

-- ============================================
-- STEP 3: Enable Row Level Security
-- ============================================
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Public can insert (subscribe) - no auth required
CREATE POLICY "Anyone can subscribe to newsletter"
ON newsletter_subscribers FOR INSERT
WITH CHECK (true);

-- Only service role can read/update/delete (admin operations)
CREATE POLICY "Service role can manage subscribers"
ON newsletter_subscribers FOR ALL
USING (auth.role() = 'service_role');

-- ============================================
-- STEP 4: Create updated_at trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_newsletter_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS newsletter_updated_at ON newsletter_subscribers;
CREATE TRIGGER newsletter_updated_at
    BEFORE UPDATE ON newsletter_subscribers
    FOR EACH ROW
    EXECUTE FUNCTION update_newsletter_updated_at();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Uncomment to verify the migration

-- Check table exists
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'newsletter_subscribers'
-- ORDER BY ordinal_position;

-- Check RLS policies
-- SELECT policyname, cmd, qual
-- FROM pg_policies
-- WHERE tablename = 'newsletter_subscribers';
