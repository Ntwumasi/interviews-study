'use client'

import { Button } from '@/components/ui/button'
import { InterviewType, DifficultyLevel } from '@/types'
import { ANALYTICS_EVENTS, trackEvent, InterviewClickedProps } from '@/types/analytics'

interface InterviewDifficultyButtonProps {
  type: InterviewType
  difficulty: DifficultyLevel
  difficultyColor: string
  difficultyLabel: string
  buttonHoverClass: string
}

export function InterviewDifficultyButton({
  type,
  difficulty,
  difficultyColor,
  difficultyLabel,
  buttonHoverClass,
}: InterviewDifficultyButtonProps) {
  const handleClick = () => {
    const url = `/interview/start?type=${type}&difficulty=${difficulty}`

    // Track interview click event
    try {
      trackEvent<InterviewClickedProps>(ANALYTICS_EVENTS.INTERVIEW_CLICKED, {
        type,
        difficulty,
        location: 'dashboard',
      })
    } catch (error) {
      console.error('Analytics tracking error (non-blocking):', error)
    }

    // Navigate to interview start
    window.location.assign(url)
  }

  return (
    <Button
      variant="ghost"
      className={`w-full justify-between items-center text-left ${buttonHoverClass} border-2 border-gray-300 dark:border-white/10 text-sm sm:text-base py-3 sm:py-3.5 px-4 h-auto rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]`}
      onClick={handleClick}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
        <span className={`font-bold ${difficultyColor} text-base sm:text-lg`}>
          {difficultyLabel}
        </span>
        <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
          AI picks scenario
        </span>
      </div>
      <span className="text-2xl sm:text-3xl">→</span>
    </Button>
  )
}
