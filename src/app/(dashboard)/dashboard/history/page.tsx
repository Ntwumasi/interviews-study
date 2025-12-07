import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { PastInterviewsSection } from '@/components/dashboard/past-interviews-section'

async function getPastInterviews(userId: string) {
  if (!supabaseAdmin) {
    return []
  }

  // Get user from Supabase
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single()

  if (!user) {
    return []
  }

  // Fetch completed interviews with scenarios and feedback
  const { data: interviews, error } = await supabaseAdmin
    .from('interviews')
    .select('*, scenario:scenarios(*), feedback:feedback(*)')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch past interviews:', error)
    return []
  }

  return interviews || []
}

export default async function HistoryPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const pastInterviews = await getPastInterviews(userId)

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10 lg:py-12 max-w-6xl">
        {/* Header */}
        <div className="mb-8 md:mb-10 lg:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 tracking-tight">
            Interview History
          </h1>
          <p className="text-lg text-white/50 max-w-xl">
            Review all your past interview performances and track your progress
          </p>
        </div>

        {/* Past Interviews Section */}
        {pastInterviews.length > 0 ? (
          <PastInterviewsSection interviews={pastInterviews} />
        ) : (
          <div className="text-center py-12 sm:py-16">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 sm:p-12 max-w-2xl mx-auto">
              <div className="w-16 h-16 mx-auto mb-6 bg-white/5 rounded-2xl flex items-center justify-center">
                <span className="text-4xl">📊</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                No interviews yet
              </h3>
              <p className="text-white/50 mb-8 max-w-md mx-auto">
                Complete your first practice interview to start building your history and tracking your progress
              </p>
              <a
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-xl hover:bg-white/90 transition-colors"
              >
                Start Your First Interview
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
