import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Code2, Network, MessageSquare, Monitor } from 'lucide-react'
import { InterviewDifficultyButton } from '@/components/dashboard/interview-difficulty-button'
import { PastInterviewsSection } from '@/components/dashboard/past-interviews-section'
import { ProgressChart } from '@/components/dashboard/progress-chart'
import { CompanyTracks } from '@/components/dashboard/company-tracks'
import { supabaseAdmin } from '@/lib/supabase'

const INTERVIEW_TYPES = [
  {
    id: 'coding',
    name: 'Coding',
    description: 'Solve algorithmic problems while explaining your approach. Practice data structures, algorithms, and problem-solving.',
    icon: Code2,
    duration: 60,
    gradient: 'from-blue-500 to-blue-600',
    accentColor: 'blue',
  },
  {
    id: 'system_design',
    name: 'System Design',
    description: 'Design scalable systems and architecture. Practice designing Twitter, Netflix, URL shorteners, and more.',
    icon: Network,
    duration: 45,
    gradient: 'from-violet-500 to-purple-600',
    accentColor: 'violet',
  },
  {
    id: 'behavioral',
    name: 'Behavioral',
    description: 'Answer STAR-format questions about your experiences. Practice storytelling, leadership, and communication.',
    icon: MessageSquare,
    duration: 30,
    gradient: 'from-emerald-500 to-emerald-600',
    accentColor: 'emerald',
  },
]

const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]

async function getPastInterviews(userId: string) {
  if (!supabaseAdmin) {
    return []
  }

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single()

  if (!user) {
    return []
  }

  const { data: interviews, error } = await supabaseAdmin
    .from('interviews')
    .select('*, scenario:scenarios(*), feedback:feedback(*)')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Failed to fetch past interviews:', error)
    return []
  }

  return interviews || []
}

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const pastInterviews = await getPastInterviews(userId)

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10 lg:py-12 max-w-6xl">
        {/* Mobile: Header Only */}
        <div className="block md:hidden mb-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2 leading-tight">
              Your Interviews
            </h1>
            <p className="text-sm text-white/50">
              Review your past interview performances
            </p>
          </div>

          {/* Mobile: Desktop Required Notice */}
          <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <Monitor className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-white">
                  Desktop required for interviews
                </p>
                <p className="text-xs text-white/50 mt-0.5">
                  Practice interviews require a larger screen. View your feedback and progress here.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop: Header */}
        <div className="hidden md:block mb-10 lg:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 tracking-tight">
            Choose Your Interview
          </h1>
          <p className="text-lg text-white/50 max-w-xl">
            Select an interview type and difficulty level to start practicing
          </p>
        </div>

        {/* Desktop: Interview Type Cards */}
        <div className="hidden md:grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {INTERVIEW_TYPES.map((type) => {
            const Icon = type.icon
            return (
              <div
                key={type.id}
                className="group relative bg-white/[0.03] border border-white/10 rounded-2xl p-6 lg:p-8 hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300"
              >
                {/* Gradient accent line on hover */}
                <div className={`absolute top-0 left-6 right-6 h-px bg-gradient-to-r ${type.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />

                {/* Icon and Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${type.gradient} bg-opacity-20`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">
                      {type.name}
                    </h2>
                  </div>
                  <span className="text-white/40 text-sm">
                    {type.duration} min
                  </span>
                </div>

                {/* Description */}
                <p className="text-white/60 text-sm leading-relaxed mb-6">
                  {type.description}
                </p>

                {/* Difficulty Selection */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
                    Select Difficulty
                  </p>
                  <div className="space-y-2">
                    {DIFFICULTY_LEVELS.map((difficulty) => (
                      <InterviewDifficultyButton
                        key={difficulty.value}
                        type={type.id as 'coding' | 'system_design' | 'behavioral'}
                        difficulty={difficulty.value as 'easy' | 'medium' | 'hard'}
                        difficultyLabel={difficulty.label}
                        accentColor={type.accentColor}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Progress Chart */}
        <ProgressChart interviews={pastInterviews} />

        {/* Company-Specific Interview Tracks */}
        <div className="hidden md:block mt-8">
          <CompanyTracks />
        </div>

        {/* Past Interviews Section */}
        {pastInterviews.length > 0 ? (
          <div className="mt-8">
            <PastInterviewsSection interviews={pastInterviews} />
          </div>
        ) : (
          <div className="block md:hidden text-center py-12">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">📝</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                No interviews yet
              </h3>
              <p className="text-sm text-white/50 max-w-xs mx-auto">
                Start your first practice interview on desktop to see results here
              </p>
            </div>
          </div>
        )}

        {/* Desktop: Help Text */}
        <div className="hidden md:block mt-10 text-center">
          <p className="text-white/40 text-sm">
            Not sure where to start? Try <span className="text-white font-medium">Medium</span> difficulty for a balanced challenge.
          </p>
        </div>
      </div>
    </div>
  )
}
