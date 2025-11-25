import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Mux webhook event types we care about
type MuxWebhookEvent = {
  type: string
  data: {
    id: string
    playback_ids?: Array<{ id: string; policy: string }>
    passthrough?: string
    status?: string
    duration?: number
    aspect_ratio?: string
    resolution_tier?: string
    max_stored_resolution?: string
    max_stored_frame_rate?: number
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: MuxWebhookEvent = await request.json()
    const { type, data } = body

    console.log(`[Mux Webhook] Received event: ${type}`)

    // Handle video asset ready event
    if (type === 'video.asset.ready') {
      const passthrough = data.passthrough ? JSON.parse(data.passthrough) : null

      if (!passthrough?.interviewId) {
        console.warn('[Mux Webhook] No interview ID in passthrough')
        return NextResponse.json({ received: true })
      }

      const playbackId = data.playback_ids?.[0]?.id

      if (!playbackId) {
        console.error('[Mux Webhook] No playback ID in asset')
        return NextResponse.json({ received: true })
      }

      // Update interview with video recording info
      if (supabaseAdmin) {
        const { error } = await supabaseAdmin
          .from('interviews')
          .update({
            video_recording_url: playbackId,
            video_asset_id: data.id,
            video_duration: data.duration,
            video_status: 'ready',
          })
          .eq('id', passthrough.interviewId)

        if (error) {
          console.error('[Mux Webhook] Failed to update interview:', error)
        } else {
          console.log(`[Mux Webhook] Updated interview ${passthrough.interviewId} with playback ID: ${playbackId}`)
        }
      }
    }

    // Handle upload cancelled or errored
    if (type === 'video.upload.cancelled' || type === 'video.asset.errored') {
      console.warn(`[Mux Webhook] Upload/asset issue: ${type}`, data)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Mux Webhook] Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

// Mux sends GET requests to verify the webhook endpoint
export async function GET() {
  return NextResponse.json({ status: 'ok' })
}
