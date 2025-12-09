import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * DELETE /api/roadmaps/[id]
 * Deletes a saved roadmap
 */
export async function DELETE(
  _request: NextRequest,
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

    const { id: roadmapId } = await params

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

    // Verify ownership and delete
    const { error: deleteError } = await supabaseAdmin
      .from('saved_roadmaps')
      .delete()
      .eq('id', roadmapId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('[Roadmaps] Failed to delete:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete roadmap' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Roadmap deleted' })
  } catch (error) {
    console.error('[Roadmaps] Error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
