import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { muxClient, isMuxConfigured } from '@/lib/mux'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if Mux is configured
    if (!isMuxConfigured() || !muxClient) {
      return NextResponse.json(
        { error: 'Video recording is not configured' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { interviewId } = body

    if (!interviewId) {
      return NextResponse.json(
        { error: 'Interview ID is required' },
        { status: 400 }
      )
    }

    // Create a direct upload URL
    // This allows the browser to upload directly to Mux without going through our server
    const upload = await muxClient.video.uploads.create({
      cors_origin: process.env.NEXT_PUBLIC_APP_URL || '*',
      new_asset_settings: {
        playback_policy: ['public'],
        // Store interview ID in passthrough for webhook identification
        passthrough: JSON.stringify({
          interviewId,
          userId,
          uploadedAt: new Date().toISOString(),
        }),
      },
    })

    return NextResponse.json({
      uploadUrl: upload.url,
      uploadId: upload.id,
    })
  } catch (error) {
    console.error('Mux upload creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create upload URL' },
      { status: 500 }
    )
  }
}
