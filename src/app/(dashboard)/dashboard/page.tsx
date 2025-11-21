import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Code2, Network, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { InterviewDifficultyButton } from '@/components/dashboard/interview-difficulty-button'
import { PastInterviewsSection } from '@/components/dashboard/past-interviews-section'
import { supabaseAdmin } from '@/lib/supabase'

const INTERVIEW_TYPES = [
  {
    id: 'coding',
    name: 'Coding Interview',
    description: 'Solve algorithmic problems while explaining your approach. Practice data structures, algorithms, and problem-solving skills.',
    icon: Code2,
    color: 'blue',
    duration: 60,
    gradient: 'from-blue-500 to-blue-600',
    borderColor: 'border-blue-500/30 hover:border-blue-500/50',
    bgColor: 'bg-blue-500/5',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    buttonHover: 'hover:bg-blue-500/10',
  },
  {
    id: 'system_design',
    name: 'System Design',
    description: 'Design scalable systems and architecture. Practice designing Twitter, Netflix, URL shorteners, and more.',
    icon: Network,
    color: 'purple',
    duration: 45,
    gradient: 'from-purple-500 to-purple-600',
    borderColor: 'border-purple-500/30 hover:border-purple-500/50',
    bgColor: 'bg-purple-500/5',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-400',
    buttonHover: 'hover:bg-purple-500/10',
  },
  {
    id: 'behavioral',
    name: 'Behavioral Interview',
    description: 'Answer STAR-format questions about your experiences. Practice storytelling, leadership, and communication skills.',
    icon: MessageSquare,
    color: 'green',
    duration: 30,
    gradient: 'from-green-500 to-green-600',
    borderColor: 'border-green-500/30 hover:border-green-500/50',
    bgColor: 'bg-green-500/5',
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-400',
    buttonHover: 'hover:bg-green-500/10',
  },
]

const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Easy', color: 'text-green-400' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-400' },
  { value: 'hard', label: 'Hard', color: 'text-red-400' },
]

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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10 lg:py-12 max-w-7xl">
        {/* Mobile: Header Only */}
        <div className="block md:hidden mb-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
              Your Interviews
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Review your past interview performances
            </p>
          </div>
        </div>

        {/* Desktop: Header */}
        <div className="hidden md:block mb-6 sm:mb-8 md:mb-10 lg:mb-12 text-center sm:text-left">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4 leading-tight">
            Choose Your Interview
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto sm:mx-0">
            Select an interview type and difficulty level to start practicing
          </p>
        </div>

        {/* Desktop: Interview Type Cards */}
        <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8 mb-8 sm:mb-10 md:mb-12">
          {INTERVIEW_TYPES.map((type) => {
            const Icon = type.icon
            return (
              <div
                key={type.id}
                className={`bg-white dark:bg-white/5 backdrop-blur-sm rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-7 lg:p-8 border-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${type.borderColor} ${type.bgColor} shadow-lg hover:shadow-xl dark:shadow-none`}
              >
                {/* Icon and Header */}
                <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-5">
                  <div className={`p-3 sm:p-3.5 md:p-4 rounded-xl sm:rounded-2xl ${type.iconBg} flex-shrink-0`}>
                    <Icon className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 ${type.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1 leading-tight">
                      {type.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1">
                        ⏱️ {type.duration} min
                      </span>
                      <span className="text-gray-400 dark:text-gray-600">•</span>
                      <span className="inline-flex items-center gap-1">
                        📹 Recorded
                      </span>
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-5 sm:mb-6 leading-relaxed line-clamp-3 sm:line-clamp-none">
                  {type.description}
                </p>

                {/* Difficulty Selection */}
                <div className="space-y-2.5 sm:space-y-3">
                  <p className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Select Difficulty
                  </p>
                  <div className="space-y-2 sm:space-y-2.5">
                    {DIFFICULTY_LEVELS.map((difficulty) => (
                      <InterviewDifficultyButton
                        key={difficulty.value}
                        type={type.id as any}
                        difficulty={difficulty.value as any}
                        difficultyColor={difficulty.color}
                        difficultyLabel={difficulty.label}
                        buttonHoverClass={type.buttonHover}
                      />
                    ))}
                  </div>
                </div>

                {/* Info Footer */}
                <div className="mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-gray-300 dark:border-white/10">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-500 leading-relaxed">
                    💡 Practice with realistic scenarios and get detailed AI feedback
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Past Interviews Section - Always visible */}
        {pastInterviews.length > 0 ? (
          <div className="mb-6">
            <PastInterviewsSection interviews={pastInterviews} />
          </div>
        ) : (
          <div className="block md:hidden text-center py-12">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl p-8 border-2 border-blue-200 dark:border-blue-500/30">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-white dark:bg-white/10 rounded-2xl flex items-center justify-center">
                  <span className="text-4xl">📝</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  No interviews yet
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-xs mx-auto">
                  Start your first practice interview to see results here
                </p>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                💡 Use the menu (☰) to start a new interview
              </div>
            </div>
          </div>
        )}

        {/* Desktop: Help Text */}
        <div className="hidden md:block mt-6 sm:mt-8 md:mt-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-3 sm:px-6 sm:py-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-500/30 rounded-2xl">
            <span className="text-2xl">💡</span>
            <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base font-medium">
              Not sure where to start? Try <span className="font-bold text-blue-600 dark:text-blue-400">Medium</span> difficulty
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
