import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/text-to-speech
 * Converts text to speech using ElevenLabs REST API
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

    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) {
      console.warn('[TTS] ELEVENLABS_API_KEY not set, voice disabled')
      return NextResponse.json(
        { error: 'Text-to-speech service not configured' },
        { status: 503 }
      )
    }

    // Use a professional, natural-sounding voice
    // Rachel (voice ID: 21m00Tcm4TlvDq8ikWAM) - Calm, professional female voice
    const voiceId = '21m00Tcm4TlvDq8ikWAM'

    console.log('[TTS] Generating speech for text length:', text.length)

    // Call ElevenLabs API directly for reliability
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[TTS] ElevenLabs API error:', response.status, errorText)
      return NextResponse.json(
        { error: `ElevenLabs API error: ${response.status}` },
        { status: response.status }
      )
    }

    // Get audio buffer from response
    const audioBuffer = await response.arrayBuffer()
    console.log('[TTS] Generated audio buffer size:', audioBuffer.byteLength)

    // Return audio as MP3
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
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
