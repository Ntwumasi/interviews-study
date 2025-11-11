# Supabase Database Migration Guide

## Overview
This migration adds support for three interview types: **Coding**, **System Design**, and **Behavioral**.

## Files
- `supabase-migration-interview-types.sql` - Main migration (run this)
- `supabase-migration-rollback.sql` - Rollback script (if needed)
- This README

## What This Migration Does

### 1. Creates ENUM Type
- Adds `interview_type` ENUM with values: `'coding'`, `'system_design'`, `'behavioral'`

### 2. Updates `scenarios` Table
- Adds `interview_type` column
- Sets existing scenarios to `'system_design'`
- Makes column NOT NULL

### 3. Updates `interviews` Table
- Adds `interview_type` column
- Adds `code_submission` (jsonb) - for coding interviews
- Adds `star_responses` (jsonb) - for behavioral interviews
- Adds `video_recording_url` (text) - for all types

### 4. Inserts Sample Scenarios
- **Coding:** "Two Sum Problem" (medium, 60 min)
- **Behavioral:** "Tell me about a time you failed" (medium, 30 min)

### 5. Creates Performance Indexes
- `idx_scenarios_interview_type`
- `idx_interviews_interview_type`
- `idx_interviews_user_type`

### 6. Updates RLS Policies
- Ensures users can view all scenario types
- Users can only access their own interviews

## How to Run

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project: https://app.supabase.com
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `supabase-migration-interview-types.sql`
5. Paste into the editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. Check for success message

### Option 2: Supabase CLI
```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migration
supabase db push --file supabase-migration-interview-types.sql
```

## Verification

After running the migration, verify it worked:

```sql
-- 1. Check interview types exist
SELECT interview_type, COUNT(*) as count
FROM scenarios
GROUP BY interview_type;

-- Expected output:
-- interview_type | count
-- system_design  | X (your existing scenarios)
-- coding         | 1
-- behavioral     | 1

-- 2. Check new columns in interviews table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'interviews'
AND column_name IN ('interview_type', 'code_submission', 'star_responses', 'video_recording_url');

-- Expected: 4 rows showing these columns exist

-- 3. View all scenarios with types
SELECT id, interview_type, title, difficulty, duration_minutes
FROM scenarios
ORDER BY interview_type, title;
```

## Rollback

If you need to undo this migration:

1. Open `supabase-migration-rollback.sql`
2. Run in Supabase SQL Editor
3. **WARNING:** This will delete data!

## Next Steps After Migration

1. **Update TypeScript Types**
   - Run: `npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts`
   - Or update `types/index.ts` manually

2. **Update Application Code**
   - Update scenario queries to filter by `interview_type`
   - Handle type-specific interview data
   - Update feedback generation logic

3. **Add More Scenarios**
   - Create more coding problems
   - Add behavioral questions
   - Expand system design scenarios

## Schema Reference

### scenarios table
```sql
- id (uuid, pk)
- interview_type (enum: 'coding' | 'system_design' | 'behavioral') -- NEW
- title (text)
- description (text)
- difficulty (text: 'easy' | 'medium' | 'hard')
- tags (text[])
- prompt (text)
- duration_minutes (int)
- created_at (timestamp)
```

### interviews table
```sql
- id (uuid, pk)
- user_id (uuid, fk)
- scenario_id (uuid, fk)
- interview_type (enum) -- NEW
- status (text)
- started_at (timestamp)
- completed_at (timestamp)
- duration_seconds (int)
- transcript (jsonb)
- diagram_data (jsonb) -- system_design only
- code_submission (jsonb) -- NEW: coding only
- star_responses (jsonb) -- NEW: behavioral only
- video_recording_url (text) -- NEW: all types
- created_at (timestamp)
```

## Troubleshooting

### Error: "type interview_type already exists"
- This is OK! The migration handles this gracefully
- The ENUM type won't be recreated

### Error: "column already exists"
- This is OK! The migration uses `IF NOT EXISTS`
- Existing columns won't be modified

### Error: "permission denied"
- Make sure you're using the service role key
- Or run from Supabase Dashboard (recommended)

### RLS Issues
- If queries fail, check RLS policies
- The migration updates basic policies
- You may need to customize for your needs

## Support

If you encounter issues:
1. Check the Supabase logs
2. Verify your database structure matches the schema
3. Review the verification queries above
4. Check this project's GitHub issues

---

**Last Updated:** 2025-11-11
**Compatible with:** Supabase PostgreSQL 15+
