'use client'

import { useState, useEffect } from 'react'
import { Volume2, MessageSquare, CheckCircle, ArrowRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InterviewType } from '@/types'

interface InterviewOnboardingProps {
  interviewType: InterviewType
  onStart: () => void
}

const INTERVIEW_TIPS: Record<InterviewType, { workspace: string; hint: string }> = {
  coding: {
    workspace: 'Use the code editor on the left to write your solution. You can run your code to test it.',
    hint: 'Talk through your approach before coding. Start with brute force, then optimize.',
  },
  system_design: {
    workspace: 'Use the whiteboard on the left to draw your architecture diagrams.',
    hint: 'Start with requirements clarification, then draw high-level design before diving into details.',
  },
  behavioral: {
    workspace: 'Use the STAR framework panels on the left to structure your response.',
    hint: 'Be specific with examples. Quantify your impact when possible.',
  },
}

export function InterviewOnboarding({ interviewType, onStart }: InterviewOnboardingProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  const tips = INTERVIEW_TIPS[interviewType]
  const formattedType = interviewType.replace('_', ' ')

  // Check localStorage on mount
  useEffect(() => {
    const dismissed = localStorage.getItem('interview-onboarding-dismissed')
    if (dismissed === 'true') {
      setIsVisible(false)
      onStart()
    }
  }, [onStart])

  const steps = [
    {
      icon: Volume2,
      title: 'Turn on your sound',
      description: 'Your AI interviewer will speak to you throughout the session. Make sure your speakers or headphones are on.',
      highlight: 'sound',
    },
    {
      icon: MessageSquare,
      title: 'Think out loud',
      description: 'Explain your reasoning as you work. The AI evaluates your thought process, not just your final answer.',
      highlight: 'communicate',
    },
    {
      icon: CheckCircle,
      title: 'When you are done',
      description: 'Click the Leave button in the top right corner, then choose Submit & Get Feedback to receive your personalized AI analysis.',
      highlight: 'submit',
    },
  ]

  const handleStart = () => {
    if (dontShowAgain) {
      localStorage.setItem('interview-onboarding-dismissed', 'true')
    }
    setIsVisible(false)
    onStart()
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleStart()
    }
  }

  const handleSkip = () => {
    handleStart()
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-[#141414] rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden">
        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-300 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <span className="capitalize">{formattedType} Interview</span>
            <span>·</span>
            <span>Quick Guide</span>
          </div>
          <h2 className="text-xl font-semibold text-white">Before You Begin</h2>
        </div>

        {/* Content - Current Step */}
        <div className="px-6 py-6">
          <div className="flex flex-col items-center text-center">
            {/* Step Icon */}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
              currentStep === 0 ? 'bg-blue-500/20' :
              currentStep === 1 ? 'bg-purple-500/20' :
              'bg-green-500/20'
            }`}>
              {(() => {
                const Icon = steps[currentStep].icon
                return <Icon className={`w-8 h-8 ${
                  currentStep === 0 ? 'text-blue-400' :
                  currentStep === 1 ? 'text-purple-400' :
                  'text-green-400'
                }`} />
              })()}
            </div>

            {/* Step Title */}
            <h3 className="text-lg font-medium text-white mb-2">
              {steps[currentStep].title}
            </h3>

            {/* Step Description */}
            <p className="text-gray-400 text-[15px] leading-relaxed max-w-sm">
              {steps[currentStep].description}
            </p>
          </div>

          {/* Interview-specific tip */}
          {currentStep === 1 && (
            <div className="mt-6 p-4 bg-white/[0.03] rounded-xl border border-white/[0.06]">
              <p className="text-sm text-gray-500 mb-1">Pro tip for {formattedType}:</p>
              <p className="text-sm text-gray-300">{tips.hint}</p>
            </div>
          )}

          {/* Workspace tip on last step */}
          {currentStep === 2 && (
            <div className="mt-6 p-4 bg-white/[0.03] rounded-xl border border-white/[0.06]">
              <p className="text-sm text-gray-500 mb-1">Your workspace:</p>
              <p className="text-sm text-gray-300">{tips.workspace}</p>
            </div>
          )}
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 pb-4">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep
                  ? 'bg-white'
                  : index < currentStep
                    ? 'bg-white/50'
                    : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center justify-between">
            {/* Don't show again checkbox */}
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/20 focus:ring-offset-0"
              />
              <span className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">
                Don&apos;t show again
              </span>
            </label>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="text-gray-400 hover:text-white"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                size="sm"
                className="bg-white text-black hover:bg-gray-200 gap-1.5"
              >
                {currentStep === steps.length - 1 ? (
                  <>Start Interview</>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
