'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Scenario, InterviewType, TranscriptMessage } from '@/types'
import { DURATION_BY_TYPE } from '@/types'
import { InterviewTimer } from './interview-timer'
import { InterviewChat } from './interview-chat'
import { InterviewWorkspace } from './interview-workspace'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface InterviewRoomProps {
  interviewId: string
  scenario: Scenario
  interviewType: InterviewType
  transcript: TranscriptMessage[]
  startedAt: string
}

export function InterviewRoom({
  interviewId,
  scenario,
  interviewType,
  transcript: initialTranscript,
  startedAt,
}: InterviewRoomProps) {
  const router = useRouter()
  const [transcript, setTranscript] = useState<TranscriptMessage[]>(initialTranscript)
  const [isEndDialogOpen, setIsEndDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeUp, setTimeUp] = useState(false)

  const durationMinutes = DURATION_BY_TYPE[interviewType]

  const handleSendMessage = async (message: string) => {
    // Add user message to transcript
    const userMessage: TranscriptMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    }

    setTranscript((prev) => [...prev, userMessage])

    try {
      // Call AI interviewer API
      const response = await fetch('/api/ai-interviewer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewId,
          message,
          transcript: [...transcript, userMessage],
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()

      // Add AI response to transcript
      const aiMessage: TranscriptMessage = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString(),
      }

      setTranscript((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error('Failed to send message:', error)
      // Add error message
      setTranscript((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date().toISOString(),
        },
      ])
    }
  }

  const handleEndInterview = () => {
    setIsEndDialogOpen(true)
  }

  const handleConfirmEnd = async () => {
    setIsSubmitting(true)

    try {
      // Update interview status to completed
      const response = await fetch(`/api/interviews/${interviewId}/complete`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to end interview')
      }

      // Navigate to feedback page
      router.push(`/feedback/${interviewId}`)
    } catch (error) {
      console.error('Failed to end interview:', error)
      setIsSubmitting(false)
      setIsEndDialogOpen(false)
    }
  }

  const handleTimeUp = () => {
    setTimeUp(true)
    setIsEndDialogOpen(true)
  }

  // Initial AI greeting
  useEffect(() => {
    if (transcript.length === 0) {
      const greeting: TranscriptMessage = {
        role: 'assistant',
        content: `Hello! I'm your AI interviewer for today. We'll be working on: **${scenario.title}**\n\n${scenario.description}\n\nYou have ${durationMinutes} minutes for this ${interviewType.replace('_', ' ')} interview. Take a moment to read the problem, and when you're ready, feel free to start by clarifying requirements or sharing your initial thoughts.\n\nGood luck!`,
        timestamp: new Date().toISOString(),
      }
      setTranscript([greeting])
    }
  }, [])

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0A0A0A]/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">{scenario.title}</h1>
            <p className="text-sm text-gray-400 mt-1">
              {interviewType.replace('_', ' ').charAt(0).toUpperCase() +
                interviewType.replace('_', ' ').slice(1)} • {scenario.difficulty}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <InterviewTimer
              durationMinutes={durationMinutes}
              startedAt={startedAt}
              onTimeUp={handleTimeUp}
            />
            <Button
              variant="destructive"
              onClick={handleEndInterview}
              disabled={isSubmitting}
            >
              End Interview
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Workspace (Diagram, Code Editor, or Text Area) */}
        <div className="w-1/2 border-r border-white/10">
          <InterviewWorkspace
            interviewId={interviewId}
            interviewType={interviewType}
          />
        </div>

        {/* Right Side: Chat Interface */}
        <div className="w-1/2">
          <InterviewChat
            transcript={transcript}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>

      {/* End Interview Confirmation Dialog */}
      <Dialog open={isEndDialogOpen} onOpenChange={setIsEndDialogOpen}>
        <DialogContent className="bg-[#0A0A0A] border-white/10">
          <DialogHeader>
            <DialogTitle>
              {timeUp ? 'Time\'s Up!' : 'End Interview?'}
            </DialogTitle>
            <DialogDescription>
              {timeUp
                ? 'Your time is up. Your interview will be submitted for feedback.'
                : 'Are you sure you want to end this interview? Your progress will be saved and you\'ll receive feedback.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {!timeUp && (
              <Button
                variant="ghost"
                onClick={() => setIsEndDialogOpen(false)}
                disabled={isSubmitting}
              >
                Continue Interview
              </Button>
            )}
            <Button
              onClick={handleConfirmEnd}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit & Get Feedback'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
