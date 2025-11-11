import { Suspense } from 'react'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { Interview, Scenario } from '@/types'
import { InterviewRoom } from '@/components/interview/interview-room'

interface InterviewPageProps {
  params: Promise<{
    id: string
  }>
}

async function getInterview(interviewId: string, userId: string) {
  if (!supabaseAdmin) {
    throw new Error('Database not configured')
  }

  console.log('[GET INTERVIEW] Fetching interview:', interviewId, 'for Clerk user:', userId)

  // Fetch interview with scenario details
  const { data: interview, error: interviewError } = await supabaseAdmin
    .from('interviews')
    .select('*, scenario:scenarios(*)')
    .eq('id', interviewId)
    .single()

  if (interviewError) {
    console.log('[GET INTERVIEW] Error fetching interview:', interviewError)
    return null
  }

  if (!interview) {
    console.log('[GET INTERVIEW] Interview not found')
    return null
  }

  console.log('[GET INTERVIEW] Interview found:', interview.id, 'user_id:', interview.user_id)

  // Verify the interview belongs to this user
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single()

  if (userError) {
    console.log('[GET INTERVIEW] Error fetching user:', userError)
    return null
  }

  if (!user) {
    console.log('[GET INTERVIEW] User not found in Supabase for Clerk ID:', userId)
    return null
  }

  console.log('[GET INTERVIEW] Supabase user found:', user.id)

  if (interview.user_id !== user.id) {
    console.log('[GET INTERVIEW] Interview does not belong to user. Interview user_id:', interview.user_id, 'Expected:', user.id)
    return null
  }

  console.log('[GET INTERVIEW] ✓ Authorization passed, returning interview')
  return interview
}

export default async function InterviewPage({ params }: InterviewPageProps) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const { id } = await params
  console.log('[INTERVIEW PAGE] Loading interview:', id, 'for user:', userId)

  const interview = await getInterview(id, userId)

  if (!interview) {
    redirect('/dashboard')
  }

  // Check if interview is already completed
  if (interview.status === 'completed') {
    redirect(`/feedback/${interview.id}`)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Suspense fallback={<InterviewLoadingSkeleton />}>
        <InterviewRoom
          interviewId={interview.id}
          scenario={interview.scenario}
          interviewType={interview.interview_type}
          transcript={interview.transcript || []}
          startedAt={interview.started_at}
        />
      </Suspense>
    </div>
  )
}

function InterviewLoadingSkeleton() {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-gray-400">Loading interview...</div>
    </div>
  )
}
