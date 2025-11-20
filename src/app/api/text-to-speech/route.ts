import { NextRequest, NextResponse } from 'next/server'
import { ElevenLabsClient } from 'elevenlabs'

/**
 * POST /api/text-to-speech
 * Converts text to speech using ElevenLabs
 */
export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json(
        { error: 'Missing text parameter' },
        { status: 400 }
      )
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      console.warn('[TTS] ELEVENLABS_API_KEY not set, voice disabled')
      return NextResponse.json(
        { error: 'Text-to-speech service not configured' },
        { status: 503 }
      )
    }

    // Initialize client for each request
    const elevenlabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    })

    // Use a professional, natural-sounding voice
    // Rachel (voice ID: 21m00Tcm4TlvDq8ikWAM) - Calm, professional female voice
    const voiceId = '21m00Tcm4TlvDq8ikWAM'

    console.log('[TTS] Generating speech for text length:', text.length)

    // Generate speech using the correct API
    // Using eleven_turbo_v2_5 which is available on the free tier
    const audio = await elevenlabs.textToSpeech.convert(voiceId, {
      text: text,
      model_id: 'eleven_turbo_v2_5',
    })

    // Convert audio stream to buffer
    const chunks: Buffer[] = []
    for await (const chunk of audio) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)

    console.log('[TTS] Generated audio buffer size:', buffer.length)

    // Return audio as MP3
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error: any) {
    console.error('[TTS] Error generating speech:', error.message || error)
    return NextResponse.json(
      { error: `Failed to generate speech: ${error.message}` },
      { status: 500 }
    )
  }
}
