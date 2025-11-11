import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Code2, Network, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

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

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Choose Your Interview
          </h1>
          <p className="text-xl text-gray-400">
            Select an interview type and difficulty level to start practicing
          </p>
        </div>

        {/* Interview Type Cards */}
        <div className="grid lg:grid-cols-3 gap-8">
          {INTERVIEW_TYPES.map((type) => {
            const Icon = type.icon
            return (
              <div
                key={type.id}
                className={`bg-white/5 backdrop-blur-sm rounded-2xl p-8 border transition-all ${type.borderColor} ${type.bgColor}`}
              >
                {/* Icon and Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className={`p-4 rounded-xl ${type.iconBg}`}>
                    <Icon className={`w-10 h-10 ${type.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {type.name}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {type.duration} minutes • Video recorded
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-300 mb-6 leading-relaxed min-h-[4.5rem]">
                  {type.description}
                </p>

                {/* Difficulty Selection */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                    Choose Difficulty
                  </p>
                  <div className="space-y-2">
                    {DIFFICULTY_LEVELS.map((difficulty) => (
                      <Link
                        key={difficulty.value}
                        href={`/interview/start?type=${type.id}&difficulty=${difficulty.value}`}
                      >
                        <Button
                          variant="ghost"
                          className={`w-full justify-start text-left ${type.buttonHover} border border-white/10`}
                        >
                          <span className={`font-semibold ${difficulty.color}`}>
                            {difficulty.label}
                          </span>
                          <span className="text-gray-400 text-sm ml-2">
                            - AI picks a scenario
                          </span>
                        </Button>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Info Footer */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-xs text-gray-500">
                    Practice with realistic scenarios and get detailed AI feedback
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Help Text */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm">
            Not sure where to start? We recommend Medium difficulty for most users.
          </p>
        </div>
      </div>
    </div>
  )
}
