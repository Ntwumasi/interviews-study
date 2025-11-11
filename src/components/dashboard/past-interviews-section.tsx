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
    <div className="mb-12">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Past Interviews</h2>
        <p className="text-gray-400">Review your previous interview performances and feedback</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all hover:bg-white/10 cursor-pointer group">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <Badge
                    variant="outline"
                    className={`
                      ${interview.interview_type === 'coding' ? 'border-green-500/20 bg-green-500/10 text-green-400' : ''}
                      ${interview.interview_type === 'system_design' ? 'border-blue-500/20 bg-blue-500/10 text-blue-400' : ''}
                      ${interview.interview_type === 'behavioral' ? 'border-purple-500/20 bg-purple-500/10 text-purple-400' : ''}
                    `}
                  >
                    {interview.interview_type.replace('_', ' ').toUpperCase()}
                  </Badge>
                  {feedback && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-blue-400" />
                      <span className="text-lg font-bold text-white">{feedback.overall_score}/10</span>
                    </div>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                  {interview.scenario.title}
                </h3>

                {/* Difficulty */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-gray-400">Difficulty:</span>
                  <span
                    className={`text-xs font-semibold ${
                      interview.scenario.difficulty === 'easy' ? 'text-green-400' :
                      interview.scenario.difficulty === 'medium' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}
                  >
                    {interview.scenario.difficulty.charAt(0).toUpperCase() + interview.scenario.difficulty.slice(1)}
                  </span>
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-gray-400">
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
                <div className="mt-4 pt-4 border-t border-white/10">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
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
