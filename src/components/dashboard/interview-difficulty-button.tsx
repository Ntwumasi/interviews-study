'use client'

import Link from 'next/link'
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
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    console.log('Interview button clicked:', { type, difficulty })
    console.log('Target URL:', e.currentTarget.href)

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
  }

  const href = `/interview/start?type=${type}&difficulty=${difficulty}`

  return (
    <Button
      variant="ghost"
      className={`w-full justify-start text-left ${buttonHoverClass} border border-white/10 text-sm sm:text-base py-2 sm:py-2.5 h-auto`}
      asChild
    >
      <Link href={href} onClick={handleClick}>
        <span className={`font-semibold ${difficultyColor}`}>
          {difficultyLabel}
        </span>
        <span className="text-gray-400 text-xs sm:text-sm ml-2">
          - AI picks a scenario
        </span>
      </Link>
    </Button>
  )
}
