'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Scenario, InterviewType, TranscriptMessage } from '@/types'
import { DURATION_BY_TYPE } from '@/types'
import { InterviewTimer } from './interview-timer'
import { InterviewChat } from './interview-chat'
import { InterviewWorkspace } from './interview-workspace'
import { UserCamera } from './user-camera'
import { AICoach } from './ai-coach'
import { Button } from '@/components/ui/button'
import { LogOut, ChevronDown, ChevronUp } from 'lucide-react'
import { InterviewRecorder } from './interview-recorder'
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
  const [isMobile, setIsMobile] = useState(false)
  const [isOutputExpanded, setIsOutputExpanded] = useState(false)
  const [elapsedMinutes, setElapsedMinutes] = useState(0)
  const [workspaceCode, setWorkspaceCode] = useState('')

  const durationMinutes = DURATION_BY_TYPE[interviewType]

  // Track elapsed time for AI coach
  useEffect(() => {
    const startTime = new Date(startedAt).getTime()
    const updateElapsed = () => {
      const now = Date.now()
      const elapsed = (now - startTime) / 60000
      setElapsedMinutes(elapsed)
    }

    updateElapsed()
    const interval = setInterval(updateElapsed, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [startedAt])

  // Detect screen size to conditionally render (not just hide) components
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

  const handleConfirmEnd = async (getFeedback: boolean = true) => {
    setIsSubmitting(true)

    try {
      if (getFeedback) {
        // Update interview status to completed and get feedback
        const response = await fetch(`/api/interviews/${interviewId}/complete`, {
          method: 'POST',
        })

        if (!response.ok) {
          throw new Error('Failed to end interview')
        }

        // Navigate to feedback page
        router.push(`/feedback/${interviewId}`)
      } else {
        // Just leave without feedback - mark as abandoned
        await fetch(`/api/interviews/${interviewId}/abandon`, {
          method: 'POST',
        }).catch(() => {
          // Silently fail - user just wants to leave
        })

        // Navigate to dashboard
        router.push('/dashboard')
      }
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

  // Auto-expand output when code runs
  useEffect(() => {
    if (codeOutput && codeOutput !== 'Run your code to see output here...') {
      setIsOutputExpanded(true)
    }
  }, [codeOutput])

  // Format interview type for display
  const formatInterviewType = (type: string) => {
    return type.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }

  return (
    <div className="h-screen flex flex-col bg-[#0f0f0f]">
      {/* Minimal Header - Apple-inspired */}
      <header className="flex-shrink-0 h-12 border-b border-white/[0.08] bg-[#0f0f0f]/80 backdrop-blur-xl">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Left: Title + Meta inline */}
          <div className="flex items-center gap-3">
            <h1 className="text-[15px] font-medium text-white tracking-tight">
              {scenario.title}
            </h1>
            <div className="flex items-center gap-2 text-[13px] text-gray-500">
              <span className="capitalize">{formatInterviewType(interviewType)}</span>
              <span className="text-gray-600">·</span>
              <span className="capitalize">{scenario.difficulty}</span>
              <span className="text-gray-600">·</span>
              <InterviewTimer
                durationMinutes={durationMinutes}
                startedAt={startedAt}
                onTimeUp={handleTimeUp}
              />
            </div>
          </div>

          {/* Right: Leave button only */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEndInterview}
            disabled={isSubmitting}
            className="h-8 px-3 text-gray-400 hover:text-white hover:bg-white/10 gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="text-[13px]">Leave</span>
          </Button>
        </div>
      </header>

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left: Code Editor + Collapsible Output */}
        <div className="flex-1 min-w-0 flex flex-col border-r border-white/[0.08]">
          {/* Workspace - Different for each interview type */}
          <div className="flex-1 min-h-0">
            <InterviewWorkspace
              interviewId={interviewId}
              interviewType={interviewType}
              scenario={scenario}
              onOutputChange={setCodeOutput}
              onRunningChange={setIsRunningCode}
              onCodeChange={setWorkspaceCode}
            />
          </div>

          {/* Collapsible Output Panel - Only for coding */}
          {interviewType === 'coding' && (
            <div className={`flex-shrink-0 border-t border-white/[0.08] bg-[#0a0a0a] transition-all duration-200 ${isOutputExpanded ? 'h-48' : 'h-9'}`}>
              {/* Output Header - Clickable to toggle */}
              <button
                onClick={() => setIsOutputExpanded(!isOutputExpanded)}
                className="w-full h-9 px-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-medium text-gray-500 uppercase tracking-wider">Output</span>
                  {isRunningCode && (
                    <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
                  )}
                  {codeOutput && !isRunningCode && codeOutput !== 'Run your code to see output here...' && (
                    <span className="h-1.5 w-1.5 bg-blue-500 rounded-full" />
                  )}
                </div>
                {isOutputExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
                ) : (
                  <ChevronUp className="h-3.5 w-3.5 text-gray-500" />
                )}
              </button>

              {/* Output Content */}
              {isOutputExpanded && (
                <div className="h-[calc(100%-36px)] overflow-y-auto px-4 pb-3">
                  <pre className="font-mono text-[13px] text-gray-400 whitespace-pre-wrap leading-relaxed">
                    {codeOutput || (
                      <span className="text-gray-600">Output will appear here when you run your code</span>
                    )}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Chat + Video Panel */}
        <div className="w-[380px] flex-shrink-0 flex flex-col bg-[#0a0a0a]">
          {/* Chat Area - Takes most space */}
          <div className="flex-1 min-h-0 border-b border-white/[0.08]">
            <InterviewChat
              transcript={transcript}
              onSendMessage={handleSendMessage}
              isAISpeaking={isAISpeaking}
            />
          </div>

          {/* Compact Video + Recording Section */}
          <div className="flex-shrink-0 p-3">
            {/* User Camera with Recording Overlay */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-[#1a1a1a] border border-white/[0.08]">
              <UserCamera />

              {/* Recording Indicator Overlay */}
              <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                <InterviewRecorder interviewId={interviewId} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Coach - Real-time hints and guidance */}
      {!isMobile && (
        <AICoach
          interviewType={interviewType}
          transcript={transcript}
          elapsedMinutes={elapsedMinutes}
          totalMinutes={durationMinutes}
          codeContent={workspaceCode}
        />
      )}

      {/* End Interview Confirmation Dialog */}
      <Dialog open={isEndDialogOpen} onOpenChange={setIsEndDialogOpen}>
        <DialogContent className="bg-[#1a1a1a] border border-white/[0.08] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[17px] font-semibold text-white">
              {timeUp ? "Time's Up" : 'Leave Interview?'}
            </DialogTitle>
            <DialogDescription className="text-[14px] text-gray-400 leading-relaxed">
              {timeUp
                ? 'Your interview will be submitted for feedback.'
                : 'Choose how you want to exit this practice session.'}
            </DialogDescription>
          </DialogHeader>

          {!timeUp ? (
            <div className="space-y-3 py-2">
              {/* Option 1: Submit & Get Feedback */}
              <button
                onClick={() => handleConfirmEnd(true)}
                disabled={isSubmitting}
                className="w-full p-4 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] transition-colors text-left group disabled:opacity-50"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-medium text-white group-hover:text-blue-400 transition-colors">
                      Submit & Get Feedback
                    </h3>
                    <p className="text-[13px] text-gray-500 mt-0.5">
                      End the interview and receive detailed AI feedback with recommendations
                    </p>
                  </div>
                </div>
              </button>

              {/* Option 2: Just Leave */}
              <button
                onClick={() => handleConfirmEnd(false)}
                disabled={isSubmitting}
                className="w-full p-4 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] transition-colors text-left group disabled:opacity-50"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-500/20 flex items-center justify-center flex-shrink-0">
                    <LogOut className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-medium text-white group-hover:text-gray-300 transition-colors">
                      Just Leave
                    </h3>
                    <p className="text-[13px] text-gray-500 mt-0.5">
                      Exit without feedback - your progress won't be saved
                    </p>
                  </div>
                </div>
              </button>
            </div>
          ) : (
            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                onClick={() => handleConfirmEnd(true)}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-500 text-white"
              >
                {isSubmitting ? 'Submitting...' : 'Get Feedback'}
              </Button>
            </DialogFooter>
          )}

          {!timeUp && (
            <div className="pt-2 border-t border-white/[0.06]">
              <button
                onClick={() => setIsEndDialogOpen(false)}
                disabled={isSubmitting}
                className="text-[13px] text-gray-500 hover:text-gray-400 transition-colors"
              >
                Cancel and continue practicing
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
