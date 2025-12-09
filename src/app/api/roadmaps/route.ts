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

    // Check if user already has this roadmap saved (same company + role)
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
    const { data: savedRoadmap, error: insertError } = await supabaseAdmin
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
      console.error('[Roadmaps] Failed to save:', insertError)
      // Check if table doesn't exist
      if (insertError.message?.includes('relation') || insertError.code === '42P01') {
        return NextResponse.json(
          { error: 'Roadmap saving is not yet enabled. Please run the database migration.' },
          { status: 500 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to save roadmap' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Roadmap saved',
      roadmapId: savedRoadmap.id,
      isUpdate: false,
    })
  } catch (error) {
    console.error('[Roadmaps] Error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
