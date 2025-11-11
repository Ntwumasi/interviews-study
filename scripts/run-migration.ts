import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  process.exit(1)
}

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

async function runMigration() {
  console.log('🚀 Starting Supabase migration...\n')

  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'supabase-migration-interview-types.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

    console.log('📄 Migration file loaded')
    console.log('🔗 Connected to:', supabaseUrl)
    console.log('⚙️  Executing migration...\n')

    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL,
    })

    if (error) {
      // Try alternative method using REST API
      console.log('⚠️  RPC method not available, trying direct execution...\n')

      // Split migration into individual statements
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))

      console.log(`📝 Found ${statements.length} SQL statements to execute\n`)

      // Execute each statement
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i] + ';'

        // Skip comments and empty statements
        if (statement.trim().startsWith('--') || statement.trim() === ';') {
          continue
        }

        console.log(`[${i + 1}/${statements.length}] Executing...`)

        try {
          // Use the Supabase REST API to execute SQL
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({ query: statement }),
          })

          if (!response.ok) {
            console.log(`   ⚠️  Warning: ${response.statusText}`)
          } else {
            console.log(`   ✅ Success`)
          }
        } catch (err) {
          console.log(`   ⚠️  Statement skipped (may need manual execution)`)
        }
      }

      console.log('\n⚠️  Migration executed with warnings')
      console.log('Please verify the results in Supabase Dashboard\n')
      await verifyMigration()
      return
    }

    console.log('✅ Migration completed successfully!\n')
    await verifyMigration()

  } catch (err) {
    console.error('❌ Migration failed:', err)
    console.error('\n💡 Try running the migration manually in Supabase Dashboard:')
    console.error('   1. Go to https://app.supabase.com')
    console.error('   2. Navigate to SQL Editor')
    console.error('   3. Copy contents of supabase-migration-interview-types.sql')
    console.error('   4. Paste and run\n')
    process.exit(1)
  }
}

async function verifyMigration() {
  console.log('🔍 Verifying migration...\n')

  try {
    // Check scenarios with interview types
    const { data: scenarios, error: scenariosError } = await supabase
      .from('scenarios')
      .select('interview_type')
      .limit(10)

    if (scenariosError) {
      console.log('⚠️  Could not verify scenarios table:', scenariosError.message)
    } else {
      const typeCounts: Record<string, number> = {}
      scenarios?.forEach(s => {
        typeCounts[s.interview_type] = (typeCounts[s.interview_type] || 0) + 1
      })

      console.log('✅ Scenarios table updated:')
      Object.entries(typeCounts).forEach(([type, count]) => {
        console.log(`   - ${type}: ${count} scenario(s)`)
      })
    }

    // Check if new columns exist in interviews table
    const { data: interviews, error: interviewsError } = await supabase
      .from('interviews')
      .select('interview_type, code_submission, star_responses, video_recording_url')
      .limit(1)

    if (interviewsError) {
      console.log('\n⚠️  Could not verify interviews table:', interviewsError.message)
      console.log('   This is expected if no interviews exist yet')
    } else {
      console.log('\n✅ Interviews table columns verified')
      console.log('   - interview_type: ✓')
      console.log('   - code_submission: ✓')
      console.log('   - star_responses: ✓')
      console.log('   - video_recording_url: ✓')
    }

    console.log('\n🎉 Migration verification complete!\n')

  } catch (err) {
    console.log('\n⚠️  Verification incomplete, but migration may have succeeded')
    console.log('   Please check Supabase Dashboard to confirm\n')
  }
}

// Run the migration
runMigration()
