import { createClient } from '@supabase/supabase-js'

// Environment variable validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
  )
}

/**
 * Public Supabase client for client-side and server-side operations.
 * Uses the anon key and respects Row Level Security (RLS) policies.
 *
 * Use this for:
 * - Client-side operations in components
 * - Server-side operations where you want RLS to apply
 * - Operations scoped to the authenticated user
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Don't persist sessions on server
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})

/**
 * Admin Supabase client for server-side operations only.
 * Uses the service role key and bypasses Row Level Security (RLS).
 *
 * ⚠️ SECURITY WARNING: This client has full database access.
 * Only use in server-side contexts (API routes, Server Components, Server Actions).
 * Never expose this client to the browser.
 *
 * Use this for:
 * - Admin operations that need to bypass RLS
 * - Background jobs and cron tasks
 * - User creation/management via webhooks
 * - Operations that need to access any user's data
 */
export const supabaseAdmin = (() => {
  if (!supabaseServiceRoleKey) {
    console.warn(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Admin client operations will fail.'
    )
    // Return null if service role key is not available
    return null
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
})()

/**
 * Type-safe database types
 *
 * To generate types from your Supabase schema, run:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts
 *
 * Then import and use:
 * import type { Database } from '@/types/database'
 * export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
 */

// Helper type for Supabase client
export type SupabaseClient = typeof supabase
export type SupabaseAdminClient = typeof supabaseAdmin
