import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/interviews/[id]/diagram
 * Retrieves the diagram for an interview
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
      .select('diagram_data, user_id, users!inner(clerk_id)')
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
      diagram: interview.diagram_data || null,
    })
  } catch (error) {
    console.error('[Diagram] Error fetching diagram:', error)
    return NextResponse.json(
      { error: 'Failed to fetch diagram' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/interviews/[id]/diagram
 * Saves diagram for an interview
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
    const { diagram } = await request.json()

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

    // Update diagram_data
    const { error: updateError } = await supabaseAdmin
      .from('interviews')
      .update({
        diagram_data: diagram,
      })
      .eq('id', interviewId)

    if (updateError) {
      console.error('[Diagram] Error saving diagram:', updateError)
      return NextResponse.json(
        { error: 'Failed to save diagram' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Diagram saved successfully' })
  } catch (error) {
    console.error('[Diagram] Error saving diagram:', error)
    return NextResponse.json(
      { error: 'Failed to save diagram' },
      { status: 500 }
    )
  }
}
