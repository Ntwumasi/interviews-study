'use client'

import { useEffect, useState } from 'react'

interface InterviewTimerProps {
  durationMinutes: number
  startedAt: string
  onTimeUp: () => void
}

export function InterviewTimer({ durationMinutes, startedAt, onTimeUp }: InterviewTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [hasCalledTimeUp, setHasCalledTimeUp] = useState(false)

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const startTime = new Date(startedAt).getTime()
      const now = Date.now()
      const elapsed = now - startTime
      const totalDuration = durationMinutes * 60 * 1000 // Convert to milliseconds
      const remaining = Math.max(0, totalDuration - elapsed)

      return Math.floor(remaining / 1000) // Convert to seconds
    }

    // Initial calculation
    setTimeRemaining(calculateTimeRemaining())

    // Update every second
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining()
      setTimeRemaining(remaining)

      // Call onTimeUp when time runs out (only once)
      if (remaining === 0 && !hasCalledTimeUp) {
        setHasCalledTimeUp(true)
        onTimeUp()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [durationMinutes, startedAt, onTimeUp, hasCalledTimeUp])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const isWarning = timeRemaining <= 5 * 60 // 5 minutes or less
  const isCritical = timeRemaining <= 60 // 1 minute or less

  return (
    <span
      className={`font-mono text-sm font-medium tabular-nums transition-colors ${
        isCritical
          ? 'text-red-500 animate-pulse'
          : isWarning
          ? 'text-amber-500'
          : 'text-gray-500 dark:text-gray-400'
      }`}
    >
      {formatTime(timeRemaining)}
    </span>
  )
}
