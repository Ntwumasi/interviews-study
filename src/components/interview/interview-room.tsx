'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Scenario, InterviewType, TranscriptMessage } from '@/types'
import { DURATION_BY_TYPE } from '@/types'
import { InterviewTimer } from './interview-timer'
import { InterviewChat } from './interview-chat'
import { InterviewWorkspace } from './interview-workspace'
import { AIInterviewerAvatar } from './ai-interviewer-avatar'
import { UserCamera } from './user-camera'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'
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
  const [isWorkspaceExpanded, setIsWorkspaceExpanded] = useState(true)
  const [isAISpeaking, setIsAISpeaking] = useState(false)

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
      setIsAISpeaking(true)

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

      // Simulate speaking animation duration based on message length
      const speakingDuration = Math.min(data.message.length * 30, 3000)
      setTimeout(() => setIsAISpeaking(false), speakingDuration)
    } catch (error) {
      console.error('Failed to send message:', error)
      setIsAISpeaking(false)
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
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Modern Header - Zoom Style */}
      <div className="border-b border-white/10 bg-black/30 backdrop-blur-sm">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-white">{scenario.title}</h1>
            <p className="text-xs sm:text-sm text-gray-400">
              {interviewType.replace('_', ' ').charAt(0).toUpperCase() +
                interviewType.replace('_', ' ').slice(1)} Interview • {scenario.difficulty}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <InterviewTimer
              durationMinutes={durationMinutes}
              startedAt={startedAt}
              onTimeUp={handleTimeUp}
            />
            <Button
              variant="destructive"
              size="sm"
              onClick={handleEndInterview}
              disabled={isSubmitting}
            >
              Leave
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Video Call Style */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Code Editor (Main Focus) */}
        <div className="flex-1 flex flex-col border-r border-white/10 overflow-hidden">
          {interviewType === 'coding' || interviewType === 'system_design' ? (
            <div className="h-full overflow-hidden">
              <InterviewWorkspace
                interviewId={interviewId}
                interviewType={interviewType}
              />
            </div>
          ) : (
            <div className="flex-1 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
          )}
        </div>

        {/* Right Side: Video + Chat */}
        <div className="w-[30%] min-w-[400px] flex flex-col">
          {/* Video Panel */}
          <div className="flex flex-col gap-3 p-3 border-b border-white/10 bg-black/20">
            {/* AI Interviewer Video */}
            <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10 shadow-xl">
              <AIInterviewerAvatar isSpeaking={isAISpeaking} interviewType={interviewType} />
            </div>

            {/* User Camera */}
            <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10 shadow-lg">
              <UserCamera />
            </div>
          </div>

          {/* Chat Interface */}
          <div className="flex-1 bg-black/20 backdrop-blur-sm">
            <InterviewChat
              transcript={transcript}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      </div>

      {/* End Interview Confirmation Dialog */}
      <Dialog open={isEndDialogOpen} onOpenChange={setIsEndDialogOpen}>
        <DialogContent className="bg-gray-900 border border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">
              {timeUp ? 'Time\'s Up!' : 'Leave Interview?'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {timeUp
                ? 'Your time is up. Your interview will be submitted for feedback.'
                : 'Are you sure you want to leave this interview? Your progress will be saved and you\'ll receive feedback.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {!timeUp && (
              <Button
                variant="ghost"
                onClick={() => setIsEndDialogOpen(false)}
                disabled={isSubmitting}
                className="text-white hover:bg-white/10"
              >
                Stay in Interview
              </Button>
            )}
            <Button
              onClick={handleConfirmEnd}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Submitting...' : 'Submit & Get Feedback'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
