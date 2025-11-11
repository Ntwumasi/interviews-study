# Setup Instructions - Run This First!

## ⚠️ CRITICAL: Database Schema Migration

Before testing the interview flow, you **must** run the schema migration in Supabase.

### Steps:

1. **Open Supabase Dashboard**
   - Go to [supabase.com](https://supabase.com)
   - Navigate to your project: `wfzfoehklqkjypzzuxtg`

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and Paste Migration**
   - Open the file `SCHEMA_MIGRATION.sql` in your project root
   - Copy ALL the contents
   - Paste into the SQL Editor

4. **Run the Migration**
   - Click "Run" button (or press Cmd/Ctrl + Enter)
   - Wait for completion (should take a few seconds)
   - You should see "Success. No rows returned"

### What This Does:

✅ Adds `interview_type` column to scenarios and interviews tables
✅ Updates difficulty constraint to include 'easy', 'medium', 'hard'
✅ Adds columns for code_submission, star_responses, video_recording_url
✅ Inserts 6 coding interview scenarios
✅ Inserts 4 behavioral interview scenarios
✅ Inserts 4 additional system design scenarios

### Verification:

After running the migration, verify it worked:

```sql
-- Check scenarios table
SELECT interview_type, difficulty, title FROM scenarios;

-- You should see 14 total scenarios:
-- - 3 system design (existing)
-- - 6 coding (new)
-- - 4 behavioral (new)
-- - 4 more system design (new)
```

---

## 🎯 Once Migration is Complete

You can then test the interview flow:

1. **Start an Interview:**
   - Go to Dashboard
   - Click any difficulty button under an interview type
   - You'll be redirected to `/interview/start?type=X&difficulty=Y`

2. **Interview Room:**
   - You'll see the interview room with timer, chat, and workspace
   - AI will greet you with the scenario
   - You can chat back and forth

3. **Complete Interview:**
   - Click "End Interview"
   - Confirm to submit
   - You'll be redirected to feedback page

---

## 🐛 Troubleshooting

### Error: "No X Y scenarios available"
- The migration didn't run or didn't complete
- Go back and run the SQL migration again

### Error: "column interview_type does not exist"
- The migration didn't run
- Run the SQL migration

### Error: "Failed to create interview session"
- Check Supabase logs in Dashboard → Logs
- Verify your SUPABASE_SERVICE_ROLE_KEY is set in .env.local

---

## 📝 Next: Test the Flow

Once the migration is done, I'll build the AI interviewer API route so you can have a conversation with the AI interviewer!
