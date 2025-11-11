-- Schema Migration: Add interview_type to scenarios table
-- Run this in your Supabase SQL Editor

-- 1. Add interview_type column to scenarios table
ALTER TABLE public.scenarios
ADD COLUMN interview_type text NOT NULL DEFAULT 'system_design'
CHECK (interview_type IN ('coding', 'system_design', 'behavioral'));

-- 2. Update difficulty check constraint to include 'easy'
ALTER TABLE public.scenarios
DROP CONSTRAINT scenarios_difficulty_check;

ALTER TABLE public.scenarios
ADD CONSTRAINT scenarios_difficulty_check
CHECK (difficulty IN ('easy', 'medium', 'hard'));

-- 3. Add interview_type column to interviews table (if not exists)
ALTER TABLE public.interviews
ADD COLUMN IF NOT EXISTS interview_type text NOT NULL DEFAULT 'system_design'
CHECK (interview_type IN ('coding', 'system_design', 'behavioral'));

-- 4. Add code_submission column to interviews table (for coding interviews)
ALTER TABLE public.interviews
ADD COLUMN IF NOT EXISTS code_submission jsonb;

-- 5. Add star_responses column to interviews table (for behavioral interviews)
ALTER TABLE public.interviews
ADD COLUMN IF NOT EXISTS star_responses jsonb;

-- 6. Add video_recording_url column to interviews table
ALTER TABLE public.interviews
ADD COLUMN IF NOT EXISTS video_recording_url text;

-- 7. Update existing system design scenarios to have correct interview_type
UPDATE public.scenarios
SET interview_type = 'system_design';

-- 8. Insert sample coding scenarios
INSERT INTO public.scenarios (interview_type, title, description, difficulty, tags, prompt, duration_minutes) VALUES
(
  'coding',
  'Two Sum',
  'Find two numbers in an array that add up to a target value.',
  'easy',
  ARRAY['arrays', 'hash tables', 'fundamentals'],
  'Given an array of integers and a target sum, return the indices of two numbers that add up to the target. You may assume exactly one solution exists.',
  60
),
(
  'coding',
  'Valid Parentheses',
  'Determine if a string of brackets is valid.',
  'easy',
  ARRAY['strings', 'stack', 'fundamentals'],
  'Given a string containing just the characters ''('', '')'', ''{'', ''}'', ''['' and '']'', determine if the input string is valid. An input string is valid if brackets close in the correct order.',
  60
),
(
  'coding',
  'Merge Two Sorted Lists',
  'Merge two sorted linked lists into one sorted list.',
  'easy',
  ARRAY['linked lists', 'recursion', 'fundamentals'],
  'You are given the heads of two sorted linked lists. Merge the two lists into one sorted list by splicing together the nodes of the first two lists. Return the head of the merged linked list.',
  60
),
(
  'coding',
  'Binary Tree Level Order Traversal',
  'Return the level-order traversal of a binary tree.',
  'medium',
  ARRAY['trees', 'breadth-first search', 'queue'],
  'Given the root of a binary tree, return the level order traversal of its nodes'' values (i.e., from left to right, level by level).',
  60
),
(
  'coding',
  'LRU Cache',
  'Design and implement a Least Recently Used (LRU) cache.',
  'medium',
  ARRAY['design', 'hash tables', 'linked lists'],
  'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement get(key) and put(key, value) methods that run in O(1) time.',
  60
),
(
  'coding',
  'Median of Two Sorted Arrays',
  'Find the median of two sorted arrays.',
  'hard',
  ARRAY['arrays', 'binary search', 'divide and conquer'],
  'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).',
  60
);

-- 9. Insert sample behavioral scenarios
INSERT INTO public.scenarios (interview_type, title, description, difficulty, tags, prompt, duration_minutes) VALUES
(
  'behavioral',
  'Conflict Resolution',
  'Describe a time when you had to resolve a conflict with a team member.',
  'medium',
  ARRAY['teamwork', 'communication', 'conflict resolution'],
  'Tell me about a time when you had a conflict with a coworker or team member. How did you handle it? What was the outcome?',
  30
),
(
  'behavioral',
  'Project Under Pressure',
  'Describe a time when you delivered a project under tight deadline.',
  'medium',
  ARRAY['time management', 'pressure', 'delivery'],
  'Tell me about a time when you had to deliver a project with a very tight deadline. How did you approach it? What was the result?',
  30
),
(
  'behavioral',
  'Technical Decision',
  'Describe a time when you made a difficult technical decision.',
  'hard',
  ARRAY['decision making', 'technical leadership', 'trade-offs'],
  'Tell me about a time when you had to make a difficult technical decision with significant trade-offs. How did you evaluate your options? What was the outcome?',
  30
),
(
  'behavioral',
  'Failure and Learning',
  'Describe a time when you failed and what you learned from it.',
  'hard',
  ARRAY['growth mindset', 'self-awareness', 'learning'],
  'Tell me about a time when you failed at something important. What happened? What did you learn? How did you apply that lesson later?',
  30
);

-- 10. Add more system design scenarios for variety
INSERT INTO public.scenarios (interview_type, title, description, difficulty, tags, prompt, duration_minutes) VALUES
(
  'system_design',
  'Design Instagram',
  'Design a photo-sharing social media platform like Instagram.',
  'hard',
  ARRAY['social media', 'image storage', 'feeds', 'scaling'],
  'Design a photo-sharing platform like Instagram. Focus on: 1) Image upload and storage, 2) User feeds and discovery, 3) Following system, 4) Real-time updates, 5) Scale to billions of users.',
  45
),
(
  'system_design',
  'Design Uber',
  'Design a ride-sharing platform like Uber.',
  'hard',
  ARRAY['real-time', 'geolocation', 'matching', 'distributed systems'],
  'Design a ride-sharing platform like Uber. Focus on: 1) Rider-driver matching, 2) Real-time location tracking, 3) Pricing and payments, 4) Handling peak demand.',
  45
),
(
  'system_design',
  'Design Dropbox',
  'Design a file storage and sync service like Dropbox.',
  'medium',
  ARRAY['file storage', 'sync', 'distributed systems'],
  'Design a file storage and synchronization service like Dropbox. Focus on: 1) File upload/download, 2) Sync across devices, 3) Conflict resolution, 4) Storage optimization.',
  45
),
(
  'system_design',
  'Design Rate Limiter',
  'Design an API rate limiting system.',
  'medium',
  ARRAY['API design', 'distributed systems', 'caching'],
  'Design a rate limiting system for APIs. Focus on: 1) Different rate limiting strategies, 2) Distributed rate limiting, 3) Handling burst traffic, 4) Monitoring and alerts.',
  45
);

-- Migration complete! ✅
