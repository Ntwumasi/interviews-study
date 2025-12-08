'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Lightbulb, X, ChevronDown, ChevronUp, Sparkles, Clock, Target, AlertCircle } from 'lucide-react'
import { InterviewType, TranscriptMessage } from '@/types'

interface AICoachProps {
  interviewType: InterviewType
  transcript: TranscriptMessage[]
  elapsedMinutes: number
  totalMinutes: number
  codeContent?: string
  onRequestHint?: () => void
}

interface Hint {
  id: string
  type: 'tip' | 'warning' | 'suggestion' | 'reminder'
  title: string
  content: string
  priority: number
}

const CODING_HINTS: Hint[] = [
  { id: 'clarify', type: 'tip', title: 'Clarify First', content: 'Ask about edge cases, input constraints, and expected output format before coding.', priority: 1 },
  { id: 'examples', type: 'tip', title: 'Work Through Examples', content: 'Trace through 2-3 examples manually before implementing. This helps catch edge cases.', priority: 2 },
  { id: 'brute-force', type: 'suggestion', title: 'Start Simple', content: 'Describe a brute force solution first, then optimize. Interviewers want to see your problem-solving process.', priority: 3 },
  { id: 'complexity', type: 'reminder', title: 'Discuss Complexity', content: 'Mention time and space complexity for your approach. This shows analytical thinking.', priority: 4 },
  { id: 'test-cases', type: 'tip', title: 'Test Your Code', content: 'Walk through your solution with test cases. Check edge cases like empty input, single element, duplicates.', priority: 5 },
  { id: 'think-aloud', type: 'reminder', title: 'Think Aloud', content: 'Verbalize your thought process. Silence makes interviewers nervous about your progress.', priority: 6 },
]

const SYSTEM_DESIGN_HINTS: Hint[] = [
  { id: 'requirements', type: 'tip', title: 'Gather Requirements', content: 'Ask about scale (users, requests/sec), data size, latency requirements, and consistency needs.', priority: 1 },
  { id: 'high-level', type: 'suggestion', title: 'Start High-Level', content: 'Draw a high-level architecture first: clients, load balancers, servers, databases, caches.', priority: 2 },
  { id: 'data-model', type: 'tip', title: 'Define Data Model', content: 'Sketch out your main entities and their relationships before diving into components.', priority: 3 },
  { id: 'tradeoffs', type: 'reminder', title: 'Discuss Trade-offs', content: 'Compare SQL vs NoSQL, consistency vs availability, different caching strategies.', priority: 4 },
  { id: 'scale', type: 'suggestion', title: 'Address Scalability', content: 'Discuss sharding, replication, CDNs, and horizontal scaling strategies.', priority: 5 },
  { id: 'bottlenecks', type: 'warning', title: 'Identify Bottlenecks', content: 'Proactively identify potential bottlenecks and how you would address them.', priority: 6 },
]

const BEHAVIORAL_HINTS: Hint[] = [
  { id: 'star', type: 'tip', title: 'Use STAR Format', content: 'Structure answers: Situation, Task, Action, Result. Keep the focus on YOUR actions.', priority: 1 },
  { id: 'specific', type: 'suggestion', title: 'Be Specific', content: 'Use concrete examples with numbers and outcomes. "Reduced load time by 40%" beats "improved performance."', priority: 2 },
  { id: 'failures', type: 'tip', title: 'Own Your Failures', content: 'When discussing failures, focus on what you learned and how you applied that learning.', priority: 3 },
  { id: 'impact', type: 'reminder', title: 'Quantify Impact', content: 'Whenever possible, mention metrics: users impacted, revenue generated, time saved.', priority: 4 },
  { id: 'leadership', type: 'suggestion', title: 'Show Leadership', content: 'Even without a title, show how you influenced, mentored, or drove initiatives.', priority: 5 },
  { id: 'concise', type: 'warning', title: 'Keep It Concise', content: 'Aim for 2-3 minute responses. Long rambling answers lose interviewer attention.', priority: 6 },
]

const TIME_BASED_WARNINGS = [
  { threshold: 0.25, message: 'First quarter - Make sure you understand the problem before diving in.' },
  { threshold: 0.5, message: 'Halfway point - You should be actively working on your solution.' },
  { threshold: 0.75, message: 'Final stretch - Focus on completing your core solution. Polish later if time permits.' },
  { threshold: 0.9, message: 'Almost done - Wrap up your current thought and prepare to summarize.' },
]

export function AICoach({
  interviewType,
  transcript,
  elapsedMinutes,
  totalMinutes,
  codeContent,
  onRequestHint,
}: AICoachProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const [shownHints, setShownHints] = useState<Set<string>>(new Set())
  const [currentHints, setCurrentHints] = useState<Hint[]>([])
  const [dismissedHints, setDismissedHints] = useState<Set<string>>(new Set())

  // Get hints based on interview type
  const allHints = useMemo(() => {
    switch (interviewType) {
      case 'coding':
        return CODING_HINTS
      case 'system_design':
        return SYSTEM_DESIGN_HINTS
      case 'behavioral':
        return BEHAVIORAL_HINTS
      default:
        return CODING_HINTS
    }
  }, [interviewType])

  // Analyze transcript and context to determine relevant hints
  const analyzeContext = useCallback(() => {
    const hints: Hint[] = []
    const messageCount = transcript.length
    const userMessages = transcript.filter(m => m.role === 'user')
    const progress = elapsedMinutes / totalMinutes

    // Time-based hints
    const timeWarning = TIME_BASED_WARNINGS.find(
      w => progress >= w.threshold && progress < w.threshold + 0.1
    )
    if (timeWarning && !dismissedHints.has(`time-${timeWarning.threshold}`)) {
      hints.push({
        id: `time-${timeWarning.threshold}`,
        type: 'warning',
        title: `${Math.round(progress * 100)}% Time Elapsed`,
        content: timeWarning.message,
        priority: 0,
      })
    }

    // Early interview hints (first 2 messages)
    if (messageCount <= 2) {
      const earlyHints = allHints.filter(h => h.priority <= 2)
      hints.push(...earlyHints.filter(h => !dismissedHints.has(h.id)))
    }
    // Mid interview hints
    else if (messageCount <= 6) {
      const midHints = allHints.filter(h => h.priority > 2 && h.priority <= 4)
      hints.push(...midHints.filter(h => !dismissedHints.has(h.id)))
    }
    // Later interview hints
    else {
      const lateHints = allHints.filter(h => h.priority > 4)
      hints.push(...lateHints.filter(h => !dismissedHints.has(h.id)))
    }

    // Detect if user hasn't spoken in a while
    if (userMessages.length > 0) {
      const lastUserMessage = userMessages[userMessages.length - 1]
      const lastUserTime = lastUserMessage.timestamp ? new Date(lastUserMessage.timestamp).getTime() : Date.now()
      const now = Date.now()
      const silenceMinutes = (now - lastUserTime) / 60000

      if (silenceMinutes > 2 && !dismissedHints.has('silence')) {
        hints.unshift({
          id: 'silence',
          type: 'reminder',
          title: 'Keep Talking',
          content: 'Share your thoughts even if you\'re stuck. Ask questions, talk through options, or explain what you\'re considering.',
          priority: 0,
        })
      }
    }

    // Coding-specific: check if discussing complexity
    if (interviewType === 'coding' && codeContent && codeContent.length > 100) {
      const hasComplexityDiscussion = transcript.some(m =>
        m.content.toLowerCase().includes('time complexity') ||
        m.content.toLowerCase().includes('space complexity') ||
        m.content.toLowerCase().includes('big o')
      )

      if (!hasComplexityDiscussion && !dismissedHints.has('complexity-reminder')) {
        hints.push({
          id: 'complexity-reminder',
          type: 'suggestion',
          title: 'Discuss Complexity',
          content: 'You have code written. Consider discussing the time and space complexity of your solution.',
          priority: 1,
        })
      }
    }

    // Sort by priority and limit
    return hints.sort((a, b) => a.priority - b.priority).slice(0, 3)
  }, [transcript, elapsedMinutes, totalMinutes, allHints, dismissedHints, codeContent, interviewType])

  // Update hints periodically
  useEffect(() => {
    setCurrentHints(analyzeContext())
  }, [analyzeContext])

  // Also update every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHints(analyzeContext())
    }, 30000)

    return () => clearInterval(interval)
  }, [analyzeContext])

  const dismissHint = (hintId: string) => {
    setDismissedHints(prev => new Set([...prev, hintId]))
    setCurrentHints(prev => prev.filter(h => h.id !== hintId))
  }

  const getHintIcon = (type: Hint['type']) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-amber-400" />
      case 'tip':
        return <Lightbulb className="w-4 h-4 text-blue-400" />
      case 'suggestion':
        return <Sparkles className="w-4 h-4 text-purple-400" />
      case 'reminder':
        return <Clock className="w-4 h-4 text-emerald-400" />
      default:
        return <Lightbulb className="w-4 h-4 text-blue-400" />
    }
  }

  const getHintBg = (type: Hint['type']) => {
    switch (type) {
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/20'
      case 'tip':
        return 'bg-blue-500/10 border-blue-500/20'
      case 'suggestion':
        return 'bg-purple-500/10 border-purple-500/20'
      case 'reminder':
        return 'bg-emerald-500/10 border-emerald-500/20'
      default:
        return 'bg-blue-500/10 border-blue-500/20'
    }
  }

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-full shadow-lg hover:bg-white/[0.05] transition-colors"
      >
        <Sparkles className="w-4 h-4 text-purple-400" />
        <span className="text-sm text-white font-medium">AI Coach</span>
        {currentHints.length > 0 && (
          <span className="w-5 h-5 rounded-full bg-purple-500 text-white text-xs font-bold flex items-center justify-center">
            {currentHints.length}
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-gradient-to-r from-purple-500/10 to-blue-500/10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-white">AI Coach</span>
          {currentHints.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-[10px] font-bold">
              {currentHints.length} hints
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            )}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
          {currentHints.length === 0 ? (
            <div className="text-center py-4">
              <Target className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">You&apos;re doing great!</p>
              <p className="text-xs text-gray-600">Hints will appear as you progress</p>
            </div>
          ) : (
            currentHints.map((hint) => (
              <div
                key={hint.id}
                className={`relative p-3 rounded-lg border ${getHintBg(hint.type)} transition-all`}
              >
                <button
                  onClick={() => dismissHint(hint.id)}
                  className="absolute top-2 right-2 p-0.5 hover:bg-white/10 rounded transition-colors"
                >
                  <X className="w-3 h-3 text-gray-500" />
                </button>
                <div className="flex items-start gap-2 pr-6">
                  <div className="flex-shrink-0 mt-0.5">
                    {getHintIcon(hint.type)}
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-white mb-0.5">
                      {hint.title}
                    </h4>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      {hint.content}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Footer */}
      {isExpanded && (
        <div className="px-4 py-2 border-t border-white/[0.06] bg-white/[0.02]">
          <p className="text-[10px] text-gray-500 text-center">
            Hints adapt based on your interview progress
          </p>
        </div>
      )}
    </div>
  )
}
