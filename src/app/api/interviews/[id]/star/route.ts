import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * POST /api/interviews/[id]/star
 * Saves STAR method responses for behavioral interviews
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
    const { starResponse } = await request.json()

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    // Verify interview exists and belongs to user
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

    if (interview.user.clerk_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Verify it's a behavioral interview
    if (interview.interview_type !== 'behavioral') {
      return NextResponse.json(
        { error: 'STAR responses are only for behavioral interviews' },
        { status: 400 }
      )
    }

    // Save STAR response
    const { error: updateError } = await supabaseAdmin
      .from('interviews')
      .update({
        star_responses: starResponse,
      })
      .eq('id', interviewId)

    if (updateError) {
      console.error('[STAR] Failed to save:', updateError)
      return NextResponse.json(
        { error: 'Failed to save STAR response' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[STAR] Error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/interviews/[id]/star
 * Retrieves saved STAR responses
 */
export async function GET(
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

    const { data: interview, error: fetchError } = await supabaseAdmin
      .from('interviews')
      .select('star_responses, user:users(clerk_id)')
      .eq('id', interviewId)
      .single()

    if (fetchError || !interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      )
    }

    // Handle the joined user data (can be object or array depending on relation)
    const userData = interview.user as unknown
    const userClerkId = Array.isArray(userData)
      ? (userData[0] as { clerk_id: string } | undefined)?.clerk_id
      : (userData as { clerk_id: string } | null)?.clerk_id

    if (!userClerkId || userClerkId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      starResponse: interview.star_responses || null,
    })
  } catch (error) {
    console.error('[STAR] Error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
