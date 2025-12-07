'use client'

import Link from 'next/link'
import { Clock, Calendar, ArrowRight } from 'lucide-react'

interface PastInterviewsSectionProps {
  interviews: any[]
}

const typeColors = {
  coding: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  system_design: 'border-violet-500/30 bg-violet-500/10 text-violet-400',
  behavioral: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
}

const difficultyColors = {
  easy: 'text-emerald-400',
  medium: 'text-yellow-400',
  hard: 'text-red-400',
}

export function PastInterviewsSection({ interviews }: PastInterviewsSectionProps) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
          Past Interviews
        </h2>
        <p className="text-sm text-white/50">
          Review your previous performances
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

          const typeKey = interview.interview_type as keyof typeof typeColors
          const difficultyKey = interview.scenario.difficulty as keyof typeof difficultyColors

          return (
            <Link key={interview.id} href={`/feedback/${interview.id}`}>
              <div className="group bg-white/[0.03] border border-white/10 rounded-xl p-5 hover:bg-white/[0.05] hover:border-white/20 transition-all cursor-pointer">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${typeColors[typeKey]}`}>
                    {interview.interview_type.replace('_', ' ')}
                  </span>
                  {feedback && (
                    <span className="text-lg font-bold text-white">
                      {feedback.overall_score}<span className="text-white/40 text-sm">/10</span>
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-base font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors line-clamp-2">
                  {interview.scenario.title}
                </h3>

                {/* Difficulty */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-medium ${difficultyColors[difficultyKey]}`}>
                    {interview.scenario.difficulty.charAt(0).toUpperCase() + interview.scenario.difficulty.slice(1)}
                  </span>
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-white/40">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{durationMinutes}m</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{completedDate}</span>
                  </div>
                </div>

                {/* View Feedback */}
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-sm text-white/60 group-hover:text-white transition-colors">
                    View feedback
                  </span>
                  <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
