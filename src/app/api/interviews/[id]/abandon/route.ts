import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * POST /api/interviews/[id]/abandon
 * Marks an interview as abandoned (left without completing)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: interviewId } = await params

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    // Get interview and verify ownership
    const { data: interview, error: fetchError } = await supabaseAdmin
      .from('interviews')
      .select('*, user:users(*)')
      .eq('id', interviewId)
      .single()

    if (fetchError || !interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      )
    }

    // Verify the interview belongs to this user
    if (interview.user.clerk_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Only abandon if still in progress
    if (interview.status !== 'in_progress') {
      return NextResponse.json(
        { error: 'Interview is not in progress' },
        { status: 400 }
      )
    }

    // Mark as abandoned
    const { error: updateError } = await supabaseAdmin
      .from('interviews')
      .update({
        status: 'abandoned',
        completed_at: new Date().toISOString(),
      })
      .eq('id', interviewId)

    if (updateError) {
      console.error('[Abandon] Failed to update interview:', updateError)
      return NextResponse.json(
        { error: 'Failed to abandon interview' },
        { status: 500 }
      )
    }

    console.log(`[Abandon] Interview ${interviewId} marked as abandoned`)

    return NextResponse.json({
      success: true,
      message: 'Interview abandoned',
    })
  } catch (error) {
    console.error('[Abandon] Error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
