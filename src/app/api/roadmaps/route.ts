import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/roadmaps
 * Fetches all saved roadmaps for the authenticated user
 */
export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    // Get user from Clerk ID
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Fetch saved roadmaps
    const { data: roadmaps, error: fetchError } = await supabaseAdmin
      .from('saved_roadmaps')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('[Roadmaps] Failed to fetch:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch roadmaps' },
        { status: 500 }
      )
    }

    return NextResponse.json({ roadmaps: roadmaps || [] })
  } catch (error) {
    console.error('[Roadmaps] Error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/roadmaps
 * Saves a new roadmap to the user's profile
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const { roadmap, jobUrl, targetDate } = await request.json()

    if (!roadmap || !roadmap.company || !roadmap.role) {
      return NextResponse.json(
        { error: 'Invalid roadmap data' },
        { status: 400 }
      )
    }

    // Get user from Clerk ID
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Use upsert to atomically insert or update (prevents race conditions)
    // This requires a unique constraint on (user_id, company, role) in the database
    const { data: savedRoadmap, error: upsertError } = await supabaseAdmin
      .from('saved_roadmaps')
      .upsert(
        {
          user_id: user.id,
          company: roadmap.company,
          role: roadmap.role,
          level: roadmap.level || null,
          roadmap_data: roadmap,
          job_url: jobUrl || null,
          target_date: targetDate || null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,company,role',
          ignoreDuplicates: false, // Update on conflict
        }
      )
      .select('id')
      .single()

    if (upsertError) {
      console.error('[Roadmaps] Failed to save:', upsertError)
      // Check if table doesn't exist
      if (upsertError.message?.includes('relation') || upsertError.code === '42P01') {
        return NextResponse.json(
          { error: 'Roadmap saving is not yet enabled. Please run the database migration.' },
          { status: 500 }
        )
      }
      // If unique constraint doesn't exist, fall back to check-then-insert pattern
      if (upsertError.code === '42P10' || upsertError.message?.includes('constraint')) {
        // Fallback: Check if existing roadmap exists
        const { data: existing } = await supabaseAdmin
          .from('saved_roadmaps')
          .select('id')
          .eq('user_id', user.id)
          .eq('company', roadmap.company)
          .eq('role', roadmap.role)
          .single()

        if (existing) {
          // Update existing roadmap
          const { error: updateError } = await supabaseAdmin
            .from('saved_roadmaps')
            .update({
              roadmap_data: roadmap,
              job_url: jobUrl || null,
              target_date: targetDate || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id)

          if (updateError) {
            console.error('[Roadmaps] Failed to update:', updateError)
            return NextResponse.json(
              { error: 'Failed to update roadmap' },
              { status: 500 }
            )
          }

          return NextResponse.json({
            message: 'Roadmap updated',
            roadmapId: existing.id,
            isUpdate: true,
          })
        }

        // Insert new roadmap
        const { data: newRoadmap, error: insertError } = await supabaseAdmin
          .from('saved_roadmaps')
          .insert({
            user_id: user.id,
            company: roadmap.company,
            role: roadmap.role,
            level: roadmap.level || null,
            roadmap_data: roadmap,
            job_url: jobUrl || null,
            target_date: targetDate || null,
          })
          .select('id')
          .single()

        if (insertError) {
          console.error('[Roadmaps] Failed to insert:', insertError)
          return NextResponse.json(
            { error: 'Failed to save roadmap' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          message: 'Roadmap saved',
          roadmapId: newRoadmap.id,
          isUpdate: false,
        })
      }

      return NextResponse.json(
        { error: 'Failed to save roadmap' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Roadmap saved',
      roadmapId: savedRoadmap.id,
    })
  } catch (error) {
    console.error('[Roadmaps] Error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
