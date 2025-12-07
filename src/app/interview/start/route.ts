import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { InterviewType, DifficultyLevel, Scenario } from '@/types'
import { ANALYTICS_EVENTS, trackEvent, InterviewStartedProps } from '@/types/analytics'

/**
 * POST /interview/start
 * Creates a new interview session and redirects to the interview room
 *
 * Query params:
 * - type: 'coding' | 'system_design' | 'behavioral'
 * - difficulty: 'easy' | 'medium' | 'hard'
 */
export async function GET(request: NextRequest) {
  try {
    // LOGGING: Request URL
    console.log('[INTERVIEW START] Full URL:', request.url)
    console.log('[INTERVIEW START] Pathname:', request.nextUrl.pathname)
    console.log('[INTERVIEW START] Search params:', request.nextUrl.searchParams.toString())

    // Check for mobile devices - redirect to dashboard with message
    const userAgent = request.headers.get('user-agent') || ''
    const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)

    if (isMobile) {
      console.log('[INTERVIEW START] Mobile device detected, redirecting to dashboard')
      const dashboardUrl = new URL('/dashboard?mobile=blocked', request.url)
      return NextResponse.redirect(dashboardUrl)
    }

    // 1. Authenticate user
    const { userId } = await auth()
    console.log('[INTERVIEW START] User ID:', userId)

    if (!userId) {
      console.log('[INTERVIEW START] ERROR: No user ID - returning 401')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') as InterviewType
    const difficulty = searchParams.get('difficulty') as DifficultyLevel

    console.log('[INTERVIEW START] Parsed type:', type, typeof type)
    console.log('[INTERVIEW START] Parsed difficulty:', difficulty, typeof difficulty)

    if (!type || !['coding', 'system_design', 'behavioral'].includes(type)) {
      console.log('[INTERVIEW START] ERROR: Invalid type -', type)
      return NextResponse.json(
        { error: 'Invalid or missing interview type. Must be: coding, system_design, or behavioral' },
        { status: 400 }
      )
    }

    if (!difficulty || !['easy', 'medium', 'hard'].includes(difficulty)) {
      console.log('[INTERVIEW START] ERROR: Invalid difficulty -', difficulty)
      return NextResponse.json(
        { error: 'Invalid or missing difficulty. Must be: easy, medium, or hard' },
        { status: 400 }
      )
    }

    console.log('[INTERVIEW START] ✓ Validation passed. Type:', type, 'Difficulty:', difficulty)

    // 3. Get or create user in Supabase
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database configuration error' },
        { status: 500 }
      )
    }

    let supabaseUserId: string

    // Check if user exists in Supabase
    const { data: existingUser, error: userFetchError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (userFetchError) {
      if (userFetchError.code === 'PGRST116') {
        // User doesn't exist, create them
        // Note: In production, this should be handled by a Clerk webhook
        // For now, we'll create a basic user record
        const { data: newUser, error: userCreateError } = await supabaseAdmin
          .from('users')
          .insert({
            clerk_id: userId,
            email: 'user@example.com', // TODO: Get from Clerk
            name: null,
          })
          .select('id')
          .single()

        if (userCreateError || !newUser) {
          console.error('Failed to create user:', userCreateError)
          return NextResponse.json(
            { error: 'Failed to create user record' },
            { status: 500 }
          )
        }

        supabaseUserId = newUser.id
      } else {
        console.error('Failed to fetch user:', userFetchError)
        return NextResponse.json(
          { error: 'Failed to fetch user' },
          { status: 500 }
        )
      }
    } else {
      supabaseUserId = existingUser.id
    }

    // 4. Query Supabase for a random scenario matching type and difficulty
    console.log('[INTERVIEW START] Querying scenarios with:', { type, difficulty })
    const { data: scenarios, error: scenarioError } = await supabaseAdmin
      .from('scenarios')
      .select('*')
      .eq('interview_type', type)
      .eq('difficulty', difficulty)

    if (scenarioError) {
      console.error('[INTERVIEW START] ERROR: Failed to fetch scenarios:', scenarioError)
      return NextResponse.json(
        { error: 'Failed to fetch interview scenarios' },
        { status: 500 }
      )
    }

    console.log('[INTERVIEW START] Found scenarios:', scenarios?.length || 0)

    if (!scenarios || scenarios.length === 0) {
      console.log('[INTERVIEW START] ERROR: No scenarios found for', { type, difficulty })
      return NextResponse.json(
        { error: `No ${difficulty} ${type} scenarios available. Please try a different combination.` },
        { status: 404 }
      )
    }

    // Pick a random scenario
    const randomIndex = Math.floor(Math.random() * scenarios.length)
    const scenario = scenarios[randomIndex] as Scenario
    console.log('[INTERVIEW START] Selected scenario:', scenario.title)

    // 5. Create new interview record
    const { data: interview, error: interviewError } = await supabaseAdmin
      .from('interviews')
      .insert({
        user_id: supabaseUserId,
        scenario_id: scenario.id,
        interview_type: type,
        status: 'in_progress',
        started_at: new Date().toISOString(),
        transcript: [],
        diagram_data: null,
        code_submission: null,
        star_responses: null,
        video_recording_url: null,
      })
      .select('id')
      .single()

    if (interviewError || !interview) {
      console.error('Failed to create interview:', interviewError)
      return NextResponse.json(
        { error: 'Failed to create interview session' },
        { status: 500 }
      )
    }

    // 6. Track analytics event
    // Note: This is server-side, so we'll log it but also track client-side in the interview room
    console.log('Interview started:', {
      interview_id: interview.id,
      type,
      difficulty,
      scenario_id: scenario.id,
      scenario_title: scenario.title,
    })

    // 7. Redirect to interview room
    const redirectUrl = new URL(`/interview/${interview.id}`, request.url)
    console.log('[INTERVIEW START] ✓ SUCCESS - Redirecting to:', redirectUrl.href)
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('Unexpected error in interview start:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
