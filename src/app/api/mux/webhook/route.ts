import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { muxClient } from '@/lib/mux'
import crypto from 'crypto'

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

/**
 * Verify Mux webhook signature
 * @see https://docs.mux.com/guides/listen-for-webhooks#verify-webhook-signatures
 */
function verifyMuxSignature(rawBody: string, signature: string, secret: string): boolean {
  // Parse the signature header: t=timestamp,v1=signature
  const parts = signature.split(',')
  const timestampPart = parts.find(p => p.startsWith('t='))
  const signaturePart = parts.find(p => p.startsWith('v1='))

  if (!timestampPart || !signaturePart) {
    return false
  }

  const timestamp = timestampPart.substring(2)
  const expectedSignature = signaturePart.substring(3)

  // Create the signed payload
  const signedPayload = `${timestamp}.${rawBody}`

  // Compute HMAC with SHA256
  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex')

  // Compare signatures (timing-safe)
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(computedSignature, 'hex')
    )
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text()
    const body: MuxWebhookEvent = JSON.parse(rawBody)

    // Verify webhook signature if secret is configured
    const webhookSecret = process.env.MUX_WEBHOOK_SECRET
    if (webhookSecret) {
      const signature = request.headers.get('mux-signature')
      if (!signature) {
        console.warn('[Mux Webhook] Missing signature header')
        return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
      }

      if (!verifyMuxSignature(rawBody, signature, webhookSecret)) {
        console.error('[Mux Webhook] Signature verification failed')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    } else {
      console.warn('[Mux Webhook] MUX_WEBHOOK_SECRET not configured - webhook signature verification disabled')
    }
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
