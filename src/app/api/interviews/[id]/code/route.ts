import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/interviews/[id]/code
 * Retrieves the code for an interview
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
        { error: 'Database configuration error' },
        { status: 500 }
      )
    }

    // Fetch interview with user verification
    const { data: interview, error } = await supabaseAdmin
      .from('interviews')
      .select('code_submission, user_id, users!inner(clerk_id)')
      .eq('id', interviewId)
      .single()

    if (error || !interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    const user = interview.users as any
    if (user?.clerk_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized access to this interview' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      code: interview.code_submission?.code || '',
      language: interview.code_submission?.language || 'javascript',
    })
  } catch (error) {
    console.error('[Code] Error fetching code:', error)
    return NextResponse.json(
      { error: 'Failed to fetch code' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/interviews/[id]/code
 * Saves code for an interview
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
    const { code, language } = await request.json()

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database configuration error' },
        { status: 500 }
      )
    }

    // Verify ownership
    const { data: interview, error: verifyError } = await supabaseAdmin
      .from('interviews')
      .select('user_id, users!inner(clerk_id)')
      .eq('id', interviewId)
      .single()

    if (verifyError || !interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      )
    }

    const user = interview.users as any
    if (user?.clerk_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized access to this interview' },
        { status: 403 }
      )
    }

    // Update code_submission
    const { error: updateError } = await supabaseAdmin
      .from('interviews')
      .update({
        code_submission: {
          code,
          language,
          test_results: [],
          submitted_at: new Date().toISOString(),
        },
      })
      .eq('id', interviewId)

    if (updateError) {
      console.error('[Code] Error saving code:', updateError)
      return NextResponse.json(
        { error: 'Failed to save code' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Code saved successfully' })
  } catch (error) {
    console.error('[Code] Error saving code:', error)
    return NextResponse.json(
      { error: 'Failed to save code' },
      { status: 500 }
    )
  }
}
