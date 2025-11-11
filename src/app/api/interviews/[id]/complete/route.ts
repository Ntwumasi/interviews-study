import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * POST /api/interviews/[id]/complete
 * Marks an interview as completed and calculates duration
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate user
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: interviewId } = await params

    // 2. Fetch interview
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database configuration error' },
        { status: 500 }
      )
    }

    const { data: interview, error: fetchError } = await supabaseAdmin
      .from('interviews')
      .select('*, user:users(*)')
      .eq('id', interviewId)
      .single()

    if (fetchError || !interview) {
      console.error('Failed to fetch interview:', fetchError)
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      )
    }

    // Verify the interview belongs to this user
    if (interview.user.clerk_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized access to this interview' },
        { status: 403 }
      )
    }

    // Check if already completed
    if (interview.status === 'completed') {
      return NextResponse.json({
        message: 'Interview already completed',
        interviewId: interview.id,
      })
    }

    // 3. Calculate duration
    const startedAt = new Date(interview.started_at)
    const completedAt = new Date()
    const durationSeconds = Math.floor((completedAt.getTime() - startedAt.getTime()) / 1000)

    // 4. Update interview status
    const { error: updateError } = await supabaseAdmin
      .from('interviews')
      .update({
        status: 'completed',
        completed_at: completedAt.toISOString(),
        duration_seconds: durationSeconds,
      })
      .eq('id', interviewId)

    if (updateError) {
      console.error('Failed to update interview:', updateError)
      return NextResponse.json(
        { error: 'Failed to complete interview' },
        { status: 500 }
      )
    }

    // 5. Trigger feedback generation (async - don't wait for it)
    // We'll call the feedback API in the background
    try {
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/interviews/${interviewId}/feedback`, {
        method: 'POST',
      }).catch((error) => {
        console.error('Failed to trigger feedback generation:', error)
      })
    } catch (error) {
      console.error('Failed to trigger feedback generation:', error)
      // Don't fail the request
    }

    return NextResponse.json({
      message: 'Interview completed successfully',
      interviewId: interview.id,
      durationSeconds,
    })
  } catch (error) {
    console.error('Error completing interview:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
