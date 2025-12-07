'use client'

import { InterviewType, DifficultyLevel } from '@/types'
import { ANALYTICS_EVENTS, trackEvent, InterviewClickedProps } from '@/types/analytics'
import { ArrowRight } from 'lucide-react'

interface InterviewDifficultyButtonProps {
  type: InterviewType
  difficulty: DifficultyLevel
  difficultyLabel: string
  accentColor: string
}

const difficultyColors = {
  easy: 'text-emerald-400',
  medium: 'text-yellow-400',
  hard: 'text-red-400',
}

export function InterviewDifficultyButton({
  type,
  difficulty,
  difficultyLabel,
  accentColor,
}: InterviewDifficultyButtonProps) {
  const handleClick = () => {
    const url = `/interview/start?type=${type}&difficulty=${difficulty}`

    try {
      trackEvent<InterviewClickedProps>(ANALYTICS_EVENTS.INTERVIEW_CLICKED, {
        type,
        difficulty,
        location: 'dashboard',
      })
    } catch (error) {
      console.error('Analytics tracking error (non-blocking):', error)
    }

    window.location.assign(url)
  }

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 rounded-xl transition-all group"
    >
      <div className="flex items-center gap-3">
        <span className={`font-semibold ${difficultyColors[difficulty]}`}>
          {difficultyLabel}
        </span>
        <span className="text-white/40 text-sm">
          Random scenario
        </span>
      </div>
      <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
    </button>
  )
}
