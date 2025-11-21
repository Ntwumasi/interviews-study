'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Scenario, InterviewType, TranscriptMessage } from '@/types'
import { DURATION_BY_TYPE } from '@/types'
import { InterviewTimer } from './interview-timer'
import { InterviewChat } from './interview-chat'
import { InterviewWorkspace } from './interview-workspace'
import { InterviewBottomPanel } from './interview-bottom-panel'
import { AIInterviewerAvatar } from './ai-interviewer-avatar'
import { UserCamera } from './user-camera'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { MessageSquare } from 'lucide-react'
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
  const [codeOutput, setCodeOutput] = useState('')
  const [isRunningCode, setIsRunningCode] = useState(false)

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
      {/* Modern Header - Sleek & Spacious */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-semibold text-white tracking-tight">{scenario.title}</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {interviewType.replace('_', ' ').charAt(0).toUpperCase() +
                  interviewType.replace('_', ' ').slice(1)} • {scenario.difficulty}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <InterviewTimer
              durationMinutes={durationMinutes}
              startedAt={startedAt}
              onTimeUp={handleTimeUp}
            />
            <ThemeToggle />
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

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Mobile Layout - Stacked Design */}
        <div className="md:hidden flex flex-col h-full">
          {/* Workspace */}
          <div className="flex-1 min-h-0 bg-[#1e1e1e]">
            {interviewType === 'coding' || interviewType === 'system_design' ? (
              <InterviewWorkspace
                interviewId={interviewId}
                interviewType={interviewType}
              />
            ) : (
              <div className="h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
            )}
          </div>

          {/* Mobile Video & Chat */}
          <div className="flex-shrink-0 h-2/5 flex flex-col border-t border-white/10 bg-black/30 backdrop-blur-xl">
            {/* Video Tabs */}
            <div className="flex gap-2 p-2 border-b border-white/10">
              <div className="flex-1 aspect-video rounded-lg overflow-hidden border border-white/20 bg-black/40">
                <AIInterviewerAvatar isSpeaking={isAISpeaking} interviewType={interviewType} />
              </div>
              <div className="flex-1 aspect-video rounded-lg overflow-hidden border border-white/20 bg-black/40">
                <UserCamera />
              </div>
            </div>
            {/* Chat */}
            <div className="flex-1 min-h-0">
              <InterviewChat
                transcript={transcript}
                onSendMessage={handleSendMessage}
              />
            </div>
          </div>
        </div>

        {/* Desktop Layout - Grid with Editor, Cameras, and Bottom Panel */}
        <div className="hidden md:flex md:flex-col h-full">
          {/* Top Section: Editor (col-10) + Cameras (col-2) */}
          <div className="flex-1 flex overflow-hidden">
            {/* Editor Area - 83% width (col-10 equivalent) */}
            <div className="flex-1 min-w-0 bg-[#1e1e1e] border-r border-white/10">
              {interviewType === 'coding' || interviewType === 'system_design' ? (
                <InterviewWorkspace
                  interviewId={interviewId}
                  interviewType={interviewType}
                  onOutputChange={setCodeOutput}
                  onRunningChange={setIsRunningCode}
                />
              ) : (
                <div className="h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
              )}
            </div>

            {/* Cameras Area - 17% width (col-2 equivalent) */}
            <div className="w-1/6 flex-shrink-0 flex flex-col gap-3 p-3 bg-black/20">
              {/* AI Interviewer Video */}
              <div className="relative aspect-video rounded-lg overflow-hidden border border-white/20 shadow-xl bg-black/40 backdrop-blur-sm">
                <AIInterviewerAvatar isSpeaking={isAISpeaking} interviewType={interviewType} />
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md">
                  <p className="text-xs font-medium text-white">AI Interviewer</p>
                </div>
              </div>

              {/* User Camera */}
              <div className="relative aspect-video rounded-lg overflow-hidden border border-white/20 shadow-xl bg-black/40 backdrop-blur-sm">
                <UserCamera />
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md">
                  <p className="text-xs font-medium text-white">You</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section: Chat + Output - Full Width */}
          <div className="h-80 flex-shrink-0 border-t border-white/10">
            <InterviewBottomPanel
              transcript={transcript}
              onSendMessage={handleSendMessage}
              codeOutput={codeOutput}
              isRunning={isRunningCode}
              showOutput={interviewType === 'coding'}
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
