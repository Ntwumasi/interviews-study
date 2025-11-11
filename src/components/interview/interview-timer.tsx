'use client'

import { useEffect, useState } from 'react'
import { Clock, AlertCircle } from 'lucide-react'

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
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-semibold transition-colors ${
        isCritical
          ? 'bg-red-500/20 text-red-400 animate-pulse'
          : isWarning
          ? 'bg-yellow-500/20 text-yellow-400'
          : 'bg-white/5 text-gray-300'
      }`}
    >
      {isCritical ? (
        <AlertCircle className="h-5 w-5" />
      ) : (
        <Clock className="h-5 w-5" />
      )}
      <span>{formatTime(timeRemaining)}</span>
    </div>
  )
}
