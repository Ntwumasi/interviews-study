import { NextRequest, NextResponse } from 'next/server'
import { ElevenLabsClient } from 'elevenlabs'

// Initialize ElevenLabs client
const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
})

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

    // Use a professional, natural-sounding voice
    // Rachel (voice ID: 21m00Tcm4TlvDq8ikWAM) - Calm, professional female voice
    const voiceId = '21m00Tcm4TlvDq8ikWAM'

    // Generate speech
    const audio = await elevenlabs.generate({
      voice: voiceId,
      text: text,
      model_id: 'eleven_monolingual_v1',
    })

    // Convert audio stream to buffer
    const chunks: Buffer[] = []
    for await (const chunk of audio) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)

    // Return audio as MP3
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('[TTS] Error generating speech:', error)
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    )
  }
}
