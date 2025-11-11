import { Suspense } from 'react'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { Interview, Scenario } from '@/types'
import { InterviewRoom } from '@/components/interview/interview-room'

interface InterviewPageProps {
  params: {
    id: string
  }
}

async function getInterview(interviewId: string, userId: string) {
  if (!supabaseAdmin) {
    throw new Error('Database not configured')
  }

  // Fetch interview with scenario details
  const { data: interview, error: interviewError } = await supabaseAdmin
    .from('interviews')
    .select('*, scenario:scenarios(*)')
    .eq('id', interviewId)
    .single()

  if (interviewError || !interview) {
    return null
  }

  // Verify the interview belongs to this user
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single()

  if (!user || interview.user_id !== user.id) {
    return null
  }

  return interview
}

export default async function InterviewPage({ params }: InterviewPageProps) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const interview = await getInterview(params.id, userId)

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
