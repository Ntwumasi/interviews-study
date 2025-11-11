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

    // Track interview click event (non-blocking)
    try {
      trackEvent<InterviewClickedProps>(ANALYTICS_EVENTS.INTERVIEW_CLICKED, {
        type,
        difficulty,
        location: 'dashboard',
      })
    } catch (error) {
      console.error('Analytics tracking error (non-blocking):', error)
    }

    // Use window.location for full page navigation to ensure query params are sent
    console.log('About to set window.location.href...')

    // Use setTimeout to ensure navigation happens after event handlers complete
    setTimeout(() => {
      try {
        console.log('Executing navigation now...')
        // Try multiple navigation methods
        console.log('Trying window.location.assign()...')
        window.location.assign(url)
        console.log('Navigation initiated successfully')
      } catch (error) {
        console.error('Failed to navigate:', error)
        // Fallback to direct href assignment
        try {
          console.log('Fallback: trying window.location.href...')
          window.location.href = url
        } catch (e2) {
          console.error('Fallback also failed:', e2)
        }
      }
    }, 100) // Increased timeout to 100ms
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
