import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { muxClient, isMuxConfigured } from '@/lib/mux'

// Get asset details (for checking upload status)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isMuxConfigured() || !muxClient) {
      return NextResponse.json(
        { error: 'Video recording is not configured' },
        { status: 503 }
      )
    }

    const { id } = await params

    // Get upload status
    const upload = await muxClient.video.uploads.retrieve(id)

    return NextResponse.json({
      status: upload.status,
      assetId: upload.asset_id,
    })
  } catch (error) {
    console.error('Mux asset retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to get asset status' },
      { status: 500 }
    )
  }
}
