'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Calendar, TrendingUp } from 'lucide-react'

interface PastInterviewsSectionProps {
  interviews: any[]
}

export function PastInterviewsSection({ interviews }: PastInterviewsSectionProps) {
  return (
    <div className="mb-8 sm:mb-12">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
          Past Interviews
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Review your previous performances
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {interviews.map((interview) => {
          const feedback = Array.isArray(interview.feedback)
            ? interview.feedback[0]
            : interview.feedback

          const durationMinutes = Math.floor(interview.duration_seconds / 60)
          const completedDate = new Date(interview.completed_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })

          return (
            <Link key={interview.id} href={`/feedback/${interview.id}`}>
              <div className="bg-white dark:bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-gray-200 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-400 transition-all hover:shadow-lg active:scale-[0.98] cursor-pointer group">
                {/* Header */}
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      interview.interview_type === 'coding' ? 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400' : ''
                    }${
                      interview.interview_type === 'system_design' ? 'border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400' : ''
                    }${
                      interview.interview_type === 'behavioral' ? 'border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400' : ''
                    }`}
                  >
                    {interview.interview_type.replace('_', ' ').toUpperCase()}
                  </Badge>
                  {feedback && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                      <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{feedback.overall_score}/10</span>
                    </div>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                  {interview.scenario.title}
                </h3>

                {/* Difficulty */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Difficulty:</span>
                  <span
                    className={`text-xs font-bold ${
                      interview.scenario.difficulty === 'easy' ? 'text-green-600 dark:text-green-400' :
                      interview.scenario.difficulty === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {interview.scenario.difficulty.charAt(0).toUpperCase() + interview.scenario.difficulty.slice(1)}
                  </span>
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-3 sm:gap-4 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{durationMinutes}m</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{completedDate}</span>
                  </div>
                </div>

                {/* View Feedback Button */}
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-white/10">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 font-medium"
                  >
                    View Feedback →
                  </Button>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
