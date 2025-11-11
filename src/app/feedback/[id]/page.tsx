import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { FeedbackDisplay } from '@/components/feedback/feedback-display'

interface FeedbackPageProps {
  params: {
    id: string
  }
}

async function getInterviewFeedback(interviewId: string, userId: string) {
  if (!supabaseAdmin) {
    throw new Error('Database not configured')
  }

  // Fetch interview with scenario and feedback
  const { data: interview, error: interviewError } = await supabaseAdmin
    .from('interviews')
    .select('*, scenario:scenarios(*), user:users(*), feedback:feedback(*)')
    .eq('id', interviewId)
    .single()

  if (interviewError || !interview) {
    return null
  }

  // Verify the interview belongs to this user
  if (interview.user.clerk_id !== userId) {
    return null
  }

  return interview
}

export default async function FeedbackPage({ params }: FeedbackPageProps) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const interview = await getInterviewFeedback(params.id, userId)

  if (!interview) {
    redirect('/dashboard')
  }

  // Check if interview is completed
  if (interview.status !== 'completed') {
    redirect(`/interview/${interview.id}`)
  }

  // Get feedback - it might be an array or a single object
  const feedback = Array.isArray(interview.feedback)
    ? interview.feedback[0]
    : interview.feedback

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <FeedbackDisplay
        interview={interview}
        scenario={interview.scenario}
        feedback={feedback}
      />
    </div>
  )
}
