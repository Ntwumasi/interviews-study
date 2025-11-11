-- Final Safe Schema Migration
-- Run this in your Supabase SQL Editor

-- 1. Add interview_type column to scenarios table (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scenarios' AND column_name = 'interview_type'
  ) THEN
    ALTER TABLE public.scenarios
    ADD COLUMN interview_type text NOT NULL DEFAULT 'system_design';
  END IF;
END $$;

-- 2. Add interview_type constraint (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'scenarios_interview_type_check' AND table_name = 'scenarios'
  ) THEN
    ALTER TABLE public.scenarios
    ADD CONSTRAINT scenarios_interview_type_check
    CHECK (interview_type IN ('coding', 'system_design', 'behavioral'));
  END IF;
END $$;

-- 3. Update difficulty check constraint to include 'easy'
DO $$
BEGIN
  -- Drop old constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'scenarios_difficulty_check' AND table_name = 'scenarios'
  ) THEN
    ALTER TABLE public.scenarios DROP CONSTRAINT scenarios_difficulty_check;
  END IF;

  -- Add new constraint
  ALTER TABLE public.scenarios
  ADD CONSTRAINT scenarios_difficulty_check
  CHECK (difficulty IN ('easy', 'medium', 'hard'));
END $$;

-- 4. Add interview_type column to interviews table (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'interviews' AND column_name = 'interview_type'
  ) THEN
    ALTER TABLE public.interviews
    ADD COLUMN interview_type text NOT NULL DEFAULT 'system_design';
  END IF;
END $$;

-- 5. Add interview_type constraint to interviews (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'interviews_interview_type_check' AND table_name = 'interviews'
  ) THEN
    ALTER TABLE public.interviews
    ADD CONSTRAINT interviews_interview_type_check
    CHECK (interview_type IN ('coding', 'system_design', 'behavioral'));
  END IF;
END $$;

-- 6. Add code_submission column (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'interviews' AND column_name = 'code_submission'
  ) THEN
    ALTER TABLE public.interviews ADD COLUMN code_submission jsonb;
  END IF;
END $$;

-- 7. Add star_responses column (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'interviews' AND column_name = 'star_responses'
  ) THEN
    ALTER TABLE public.interviews ADD COLUMN star_responses jsonb;
  END IF;
END $$;

-- 8. Add video_recording_url column (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'interviews' AND column_name = 'video_recording_url'
  ) THEN
    ALTER TABLE public.interviews ADD COLUMN video_recording_url text;
  END IF;
END $$;

-- 9. Insert sample coding scenarios (only if they don't exist)
INSERT INTO public.scenarios (interview_type, title, description, difficulty, tags, prompt, duration_minutes)
SELECT 'coding', 'Two Sum', 'Find two numbers in an array that add up to a target value.', 'easy',
  ARRAY['arrays', 'hash tables', 'fundamentals'],
  'Given an array of integers and a target sum, return the indices of two numbers that add up to the target. You may assume exactly one solution exists.',
  60
WHERE NOT EXISTS (SELECT 1 FROM public.scenarios WHERE title = 'Two Sum');

INSERT INTO public.scenarios (interview_type, title, description, difficulty, tags, prompt, duration_minutes)
SELECT 'coding', 'Valid Parentheses', 'Determine if a string of brackets is valid.', 'easy',
  ARRAY['strings', 'stack', 'fundamentals'],
  'Given a string containing just the characters ''('', '')'', ''{'', ''}'', ''['' and '']'', determine if the input string is valid. Brackets must close in the correct order.',
  60
WHERE NOT EXISTS (SELECT 1 FROM public.scenarios WHERE title = 'Valid Parentheses');

INSERT INTO public.scenarios (interview_type, title, description, difficulty, tags, prompt, duration_minutes)
SELECT 'coding', 'Longest Substring Without Repeating Characters', 'Find the length of the longest substring without repeating characters.', 'medium',
  ARRAY['strings', 'sliding window', 'hash tables'],
  'Given a string, find the length of the longest substring without repeating characters. For example, "abcabcbb" returns 3 (abc).',
  60
WHERE NOT EXISTS (SELECT 1 FROM public.scenarios WHERE title = 'Longest Substring Without Repeating Characters');

INSERT INTO public.scenarios (interview_type, title, description, difficulty, tags, prompt, duration_minutes)
SELECT 'coding', 'Add Two Numbers (Linked Lists)', 'Add two numbers represented as linked lists.', 'medium',
  ARRAY['linked lists', 'math', 'recursion'],
  'You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order. Add the two numbers and return the sum as a linked list.',
  60
WHERE NOT EXISTS (SELECT 1 FROM public.scenarios WHERE title = 'Add Two Numbers (Linked Lists)');

INSERT INTO public.scenarios (interview_type, title, description, difficulty, tags, prompt, duration_minutes)
SELECT 'coding', 'Median of Two Sorted Arrays', 'Find the median of two sorted arrays in log time.', 'hard',
  ARRAY['arrays', 'binary search', 'divide and conquer'],
  'Given two sorted arrays, find the median of the combined array in O(log(m+n)) time complexity.',
  60
WHERE NOT EXISTS (SELECT 1 FROM public.scenarios WHERE title = 'Median of Two Sorted Arrays');

INSERT INTO public.scenarios (interview_type, title, description, difficulty, tags, prompt, duration_minutes)
SELECT 'coding', 'Trapping Rain Water', 'Calculate how much rain water can be trapped between bars.', 'hard',
  ARRAY['arrays', 'two pointers', 'dynamic programming'],
  'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water can be trapped after raining.',
  60
WHERE NOT EXISTS (SELECT 1 FROM public.scenarios WHERE title = 'Trapping Rain Water');

-- 10. Insert sample behavioral scenarios
INSERT INTO public.scenarios (interview_type, title, description, difficulty, tags, prompt, duration_minutes)
SELECT 'behavioral', 'Leadership and Conflict Resolution', 'Demonstrate leadership skills in challenging situations.', 'medium',
  ARRAY['leadership', 'conflict resolution', 'teamwork'],
  'Tell me about a time when you had to lead a team through a difficult situation. What was the challenge, how did you approach it, and what was the outcome?',
  30
WHERE NOT EXISTS (SELECT 1 FROM public.scenarios WHERE title = 'Leadership and Conflict Resolution');

INSERT INTO public.scenarios (interview_type, title, description, difficulty, tags, prompt, duration_minutes)
SELECT 'behavioral', 'Handling Failure and Learning', 'Discuss how you handle setbacks and learn from mistakes.', 'easy',
  ARRAY['growth mindset', 'resilience', 'self-awareness'],
  'Describe a time when you failed at something important. What happened? What did you learn? How did you apply that lesson later?',
  30
WHERE NOT EXISTS (SELECT 1 FROM public.scenarios WHERE title = 'Handling Failure and Learning');

INSERT INTO public.scenarios (interview_type, title, description, difficulty, tags, prompt, duration_minutes)
SELECT 'behavioral', 'Innovation and Problem Solving', 'Share examples of creative problem solving.', 'medium',
  ARRAY['innovation', 'creativity', 'impact'],
  'Tell me about a time when you came up with a creative solution to a difficult problem. What was the situation, what did others suggest, and why was your approach different?',
  30
WHERE NOT EXISTS (SELECT 1 FROM public.scenarios WHERE title = 'Innovation and Problem Solving');

INSERT INTO public.scenarios (interview_type, title, description, difficulty, tags, prompt, duration_minutes)
SELECT 'behavioral', 'Cross-functional Collaboration', 'Demonstrate ability to work across teams and disciplines.', 'hard',
  ARRAY['collaboration', 'communication', 'stakeholder management'],
  'Describe a situation where you had to collaborate with multiple teams or stakeholders with competing priorities. How did you navigate the challenges and achieve alignment?',
  30
WHERE NOT EXISTS (SELECT 1 FROM public.scenarios WHERE title = 'Cross-functional Collaboration');

-- 11. Add more system design scenarios for variety
INSERT INTO public.scenarios (interview_type, title, description, difficulty, tags, prompt, duration_minutes)
SELECT 'system_design', 'Design Instagram', 'Design a photo-sharing social media platform like Instagram.', 'hard',
  ARRAY['social media', 'image storage', 'feeds', 'scaling'],
  'Design a photo-sharing platform like Instagram. Focus on: 1) Image upload and storage, 2) User feeds and discovery, 3) Following system, 4) Scale to billions of users.',
  45
WHERE NOT EXISTS (SELECT 1 FROM public.scenarios WHERE title = 'Design Instagram');

INSERT INTO public.scenarios (interview_type, title, description, difficulty, tags, prompt, duration_minutes)
SELECT 'system_design', 'Design Uber', 'Design a ride-sharing platform like Uber.', 'hard',
  ARRAY['real-time', 'geolocation', 'matching', 'distributed systems'],
  'Design a ride-sharing platform like Uber. Focus on: 1) Rider-driver matching, 2) Real-time location tracking, 3) Pricing and payments, 4) Handling peak demand.',
  45
WHERE NOT EXISTS (SELECT 1 FROM public.scenarios WHERE title = 'Design Uber');

INSERT INTO public.scenarios (interview_type, title, description, difficulty, tags, prompt, duration_minutes)
SELECT 'system_design', 'Design Dropbox', 'Design a file storage and synchronization service like Dropbox.', 'medium',
  ARRAY['file storage', 'sync', 'distributed systems'],
  'Design a file storage and synchronization service like Dropbox. Focus on: 1) File upload/download, 2) Sync across devices, 3) Conflict resolution, 4) Storage optimization.',
  45
WHERE NOT EXISTS (SELECT 1 FROM public.scenarios WHERE title = 'Design Dropbox');

INSERT INTO public.scenarios (interview_type, title, description, difficulty, tags, prompt, duration_minutes)
SELECT 'system_design', 'Design Rate Limiter', 'Design an API rate limiting system.', 'medium',
  ARRAY['API design', 'rate limiting', 'distributed systems', 'caching'],
  'Design a rate limiting system for APIs. Focus on: 1) Different rate limiting strategies, 2) Distributed rate limiting, 3) Handling burst traffic, 4) Monitoring and alerts.',
  45
WHERE NOT EXISTS (SELECT 1 FROM public.scenarios WHERE title = 'Design Rate Limiter');

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully! All tables and scenarios are ready.';
END $$;
