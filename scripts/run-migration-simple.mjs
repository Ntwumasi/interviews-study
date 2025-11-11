// Simple migration runner using Supabase client
// Run with: node --env-file=.env.local scripts/run-migration-simple.mjs

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

console.log('🚀 Running Supabase migration...\n')
console.log('🔗 Connected to:', supabaseUrl)
console.log('\n⚠️  This script will execute SQL through Supabase REST API')
console.log('   For best results, run the full SQL in Supabase Dashboard\n')

async function runMigration() {
  try {
    // Insert Two Sum coding scenario
    console.log('[1/2] Inserting Two Sum coding scenario...')
    const { data: twoSum, error: twoSumError } = await supabase
      .from('scenarios')
      .insert({
        interview_type: 'coding',
        title: 'Two Sum Problem',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        difficulty: 'medium',
        tags: ['arrays', 'hash-table', 'two-pointers'],
        prompt: `Solve the Two Sum problem. Explain your approach, write clean code, and analyze the time and space complexity.

Example:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

Constraints:
- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- Only one valid answer exists.

Start by discussing your approach with the interviewer before coding.`,
        duration_minutes: 60
      })
      .select()

    if (twoSumError) {
      console.log('   ⚠️  Error:', twoSumError.message)
      console.log('   This is expected if interview_type column doesn\'t exist yet')
      console.log('   Run the full migration SQL in Supabase Dashboard first\n')
      return false
    } else {
      console.log('   ✅ Created:', twoSum[0]?.title)
    }

    // Insert Behavioral scenario
    console.log('[2/2] Inserting Behavioral scenario...')
    const { data: behavioral, error: behavioralError } = await supabase
      .from('scenarios')
      .insert({
        interview_type: 'behavioral',
        title: 'Tell me about a time you failed',
        description: 'Describe a significant professional failure or setback. Focus on what you learned.',
        difficulty: 'medium',
        tags: ['self-awareness', 'growth-mindset', 'resilience'],
        prompt: `Tell me about a time you failed at work.

Use STAR format:
- Situation: What was the context?
- Task: What were you responsible for?
- Action: What did you do?
- Result: What was the outcome?

Focus on learnings and growth. Be specific with examples.`,
        duration_minutes: 30
      })
      .select()

    if (behavioralError) {
      console.log('   ⚠️  Error:', behavioralError.message)
      return false
    } else {
      console.log('   ✅ Created:', behavioral[0]?.title)
    }

    console.log('\n✅ Sample scenarios created successfully!\n')
    return true

  } catch (err) {
    console.error('❌ Error:', err.message)
    return false
  }
}

async function verifySetup() {
  console.log('🔍 Verifying database setup...\n')

  // Check if scenarios table has interview_type column
  const { data, error } = await supabase
    .from('scenarios')
    .select('interview_type, title')
    .limit(5)

  if (error) {
    if (error.message.includes('interview_type')) {
      console.log('❌ The interview_type column does not exist yet\n')
      console.log('📋 You need to run the full migration SQL first:')
      console.log('   1. Go to Supabase Dashboard → SQL Editor')
      console.log('   2. Open: supabase-migration-interview-types.sql')
      console.log('   3. Copy all contents and paste into SQL Editor')
      console.log('   4. Click Run')
      console.log('   5. Then run this script again\n')
      return false
    }
    console.log('⚠️  Error:', error.message)
    return false
  }

  console.log('✅ Database schema is ready')
  console.log(`📊 Found ${data?.length || 0} scenarios\n`)

  if (data && data.length > 0) {
    console.log('Current scenarios:')
    data.forEach(s => {
      console.log(`   - ${s.interview_type || 'unknown'}: ${s.title}`)
    })
    console.log()
  }

  return true
}

// Main execution
(async () => {
  const isReady = await verifySetup()

  if (!isReady) {
    console.log('⚠️  Database not ready for data insertion')
    console.log('   Run the full SQL migration in Supabase Dashboard first\n')
    process.exit(1)
  }

  const success = await runMigration()

  if (success) {
    console.log('🎉 Migration complete!')
    console.log('   You can now use the new interview types\n')
  } else {
    console.log('⚠️  Migration incomplete')
    console.log('   Check Supabase Dashboard for details\n')
    process.exit(1)
  }
})()
