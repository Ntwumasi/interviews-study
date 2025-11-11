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
    console.log('Interview button clicked:', { type, difficulty })

    const url = `/interview/start?type=${type}&difficulty=${difficulty}`
    console.log('Navigating to:', url)
    console.log('Full URL will be:', window.location.origin + url)

    // TEMPORARILY DISABLED: Track interview click event
    // try {
    //   trackEvent<InterviewClickedProps>(ANALYTICS_EVENTS.INTERVIEW_CLICKED, {
    //     type,
    //     difficulty,
    //     location: 'dashboard',
    //   })
    // } catch (error) {
    //   console.error('Analytics tracking error (non-blocking):', error)
    // }

    // Use window.location for full page navigation to ensure query params are sent
    console.log('About to navigate (PostHog tracking disabled for testing)...')

    // Try immediate navigation without setTimeout
    try {
      console.log('Attempting immediate navigation...')
      window.location.assign(url)
      console.log('Navigation initiated successfully')
    } catch (error) {
      console.error('Failed to navigate:', error)
    }
  }

  return (
    <Button
      variant="ghost"
      className={`w-full justify-start text-left ${buttonHoverClass} border border-white/10 text-sm sm:text-base py-2 sm:py-2.5 h-auto`}
      onClick={handleClick}
    >
      <span className={`font-semibold ${difficultyColor}`}>
        {difficultyLabel}
      </span>
      <span className="text-gray-400 text-xs sm:text-sm ml-2">
        - AI picks a scenario
      </span>
    </Button>
  )
}
