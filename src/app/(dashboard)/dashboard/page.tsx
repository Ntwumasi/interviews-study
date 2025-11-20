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
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 md:py-12">
        {/* Header */}
        <div className="mb-8 sm:mb-10 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Choose Your Interview
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400">
            Select an interview type and difficulty level to start practicing
          </p>
        </div>

        {/* Interview Type Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-12">
          {INTERVIEW_TYPES.map((type) => {
            const Icon = type.icon
            return (
              <div
                key={type.id}
                className={`bg-white dark:bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border transition-all ${type.borderColor} ${type.bgColor} shadow-lg dark:shadow-none`}
              >
                {/* Icon and Header */}
                <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
                  <div className={`p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl ${type.iconBg}`}>
                    <Icon className={`w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 ${type.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-0.5 sm:mb-1">
                      {type.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {type.duration} minutes • Video recorded
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-4 sm:mb-5 md:mb-6 leading-relaxed min-h-[3.5rem] sm:min-h-[4.5rem]">
                  {type.description}
                </p>

                {/* Difficulty Selection */}
                <div className="space-y-2 sm:space-y-3">
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Choose Difficulty
                  </p>
                  <div className="space-y-1.5 sm:space-y-2">
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
                <div className="mt-4 sm:mt-5 md:mt-6 pt-4 sm:pt-5 md:pt-6 border-t border-gray-300 dark:border-white/10">
                  <p className="text-xs text-gray-600 dark:text-gray-500">
                    Practice with realistic scenarios and get detailed AI feedback
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Past Interviews Section */}
        {pastInterviews.length > 0 && (
          <PastInterviewsSection interviews={pastInterviews} />
        )}

        {/* Help Text */}
        <div className="mt-8 sm:mt-10 md:mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm px-4">
            Not sure where to start? We recommend Medium difficulty for most users.
          </p>
        </div>
      </div>
    </div>
  )
}
