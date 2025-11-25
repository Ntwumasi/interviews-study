'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, TrendingUp, MessageSquare, Lightbulb, CheckCircle2, AlertCircle, PlayCircle, Video } from 'lucide-react'
import { InterviewPlayer } from '@/components/interview/interview-player'
import ReactMarkdown from 'react-markdown'

interface FeedbackDisplayProps {
  interview: any
  scenario: any
  feedback: any
}

export function FeedbackDisplay({ interview, scenario, feedback: initialFeedback }: FeedbackDisplayProps) {
  const router = useRouter()
  const [feedback, setFeedback] = useState(initialFeedback)
  const [isGenerating, setIsGenerating] = useState(!initialFeedback)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If no feedback yet, poll until it's generated
    if (!feedback) {
      let pollCount = 0
      let hasTriggeredGeneration = false

      const pollFeedback = async () => {
        try {
          // Trigger feedback generation on first poll
          if (!hasTriggeredGeneration) {
            hasTriggeredGeneration = true
            console.log('[Feedback] Triggering feedback generation')
            const postResponse = await fetch(`/api/interviews/${interview.id}/feedback`, {
              method: 'POST',
            })

            if (!postResponse.ok) {
              const errorData = await postResponse.json()
              console.error('[Feedback] Failed to trigger generation:', errorData)
              setError(errorData.error || 'Failed to start feedback generation')
              setIsGenerating(false)
              return
            }
          }

          // Check if feedback exists
          const response = await fetch(`/api/interviews/${interview.id}/feedback`)
          if (response.ok) {
            const data = await response.json()
            if (data.feedback) {
              console.log('[Feedback] Feedback received successfully')
              setFeedback(data.feedback)
              setIsGenerating(false)
              return
            }
          } else if (response.status !== 404) {
            // 404 is expected while feedback is being generated, other errors are not
            const errorData = await response.json()
            console.error('[Feedback] Error fetching feedback:', errorData)
          }

          pollCount++

          // Stop polling after 30 attempts (60 seconds)
          if (pollCount >= 30) {
            console.warn('[Feedback] Timeout after 30 polling attempts')
            setError('Feedback generation is taking longer than expected. Please refresh the page or try again later.')
            setIsGenerating(false)
          }
        } catch (error) {
          console.error('[Feedback] Failed to fetch feedback:', error)
          setError('Failed to generate feedback. Please try again later.')
          setIsGenerating(false)
        }
      }

      // Poll every 2 seconds
      const interval = setInterval(pollFeedback, 2000)
      pollFeedback() // Initial call

      return () => clearInterval(interval)
    }
  }, [feedback, interview.id])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Feedback Generation Issue</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.refresh()} variant="outline">
              Refresh Page
            </Button>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Generating Your Feedback...</h2>
          <p className="text-gray-400">Our AI is analyzing your interview performance</p>
          <p className="text-gray-500 text-sm mt-2">This usually takes 10-30 seconds</p>
        </div>
      </div>
    )
  }

  const durationMinutes = Math.floor(interview.duration_seconds / 60)
  const durationSeconds = interview.duration_seconds % 60

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-4 -ml-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Interview Feedback</h1>
            <p className="text-gray-400">{scenario.title}</p>
          </div>
          <Badge
            variant="outline"
            className={`
              ${interview.interview_type === 'coding' ? 'border-green-500/20 bg-green-500/10 text-green-400' : ''}
              ${interview.interview_type === 'system_design' ? 'border-blue-500/20 bg-blue-500/10 text-blue-400' : ''}
              ${interview.interview_type === 'behavioral' ? 'border-purple-500/20 bg-purple-500/10 text-purple-400' : ''}
            `}
          >
            {interview.interview_type.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>

        <div className="flex gap-4 mt-4 text-sm text-gray-400">
          <span>Difficulty: <span className="text-white font-semibold">{scenario.difficulty}</span></span>
          <span>•</span>
          <span>Duration: <span className="text-white font-semibold">{durationMinutes}m {durationSeconds}s</span></span>
          <span>•</span>
          <span>Completed: <span className="text-white font-semibold">{new Date(interview.completed_at).toLocaleDateString()}</span></span>
        </div>
      </div>

      {/* Overall Score */}
      <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 rounded-lg p-8 mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <TrendingUp className="h-8 w-8 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Overall Score</h2>
        </div>
        <div className="text-6xl font-bold text-white mb-2">{feedback.overall_score}<span className="text-3xl text-gray-400">/10</span></div>
        <p className="text-gray-300 text-lg">
          {feedback.overall_score >= 8 ? 'Excellent performance!' :
           feedback.overall_score >= 6 ? 'Good job!' :
           feedback.overall_score >= 4 ? 'Needs improvement' :
           'Keep practicing!'}
        </p>
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <ScoreCard
          title="Technical Accuracy"
          score={feedback.technical_accuracy}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <ScoreCard
          title="Communication"
          score={feedback.communication}
          icon={<MessageSquare className="h-5 w-5" />}
        />
        <ScoreCard
          title="Problem Solving"
          score={feedback.problem_solving}
          icon={<Lightbulb className="h-5 w-5" />}
        />
      </div>

      {/* Strengths */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="h-5 w-5 text-green-400" />
          <h3 className="text-xl font-semibold text-white">Strengths</h3>
        </div>
        <ul className="space-y-2">
          {feedback.strengths.map((strength: string, index: number) => (
            <li key={index} className="flex items-start gap-3 text-gray-300">
              <span className="text-green-400 mt-1">✓</span>
              <span>{strength}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Areas for Improvement */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="h-5 w-5 text-yellow-400" />
          <h3 className="text-xl font-semibold text-white">Areas for Improvement</h3>
        </div>
        <ul className="space-y-2">
          {feedback.areas_for_improvement.map((area: string, index: number) => (
            <li key={index} className="flex items-start gap-3 text-gray-300">
              <span className="text-yellow-400 mt-1">→</span>
              <span>{area}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Detailed Feedback */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">Detailed Feedback</h3>
        <div className="prose prose-invert prose-sm max-w-none prose-headings:text-gray-200 prose-p:text-gray-300 prose-strong:text-gray-200 prose-li:text-gray-300">
          <ReactMarkdown>{feedback.detailed_feedback}</ReactMarkdown>
        </div>
      </div>

      {/* Video Recording Review */}
      {interview.video_playback_id && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Video className="h-5 w-5 text-purple-400" />
            <h3 className="text-xl font-semibold text-white">Review Your Recording</h3>
          </div>
          <p className="text-gray-400 text-sm mb-6">
            Watch your interview recording to see your body language, communication style, and identify areas for improvement.
          </p>
          <InterviewPlayer
            playbackId={interview.video_playback_id}
            transcript={interview.transcript || []}
            duration={interview.video_duration}
            title={scenario.title}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        <Link href="/dashboard">
          <Button size="lg" variant="outline">
            Back to Dashboard
          </Button>
        </Link>
        <Link href={`/interview/start?type=${interview.interview_type}&difficulty=${scenario.difficulty}`}>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            Practice Again
          </Button>
        </Link>
      </div>
    </div>
  )
}

function ScoreCard({ title, score, icon }: { title: string; score: number; icon: React.ReactNode }) {
  const percentage = (score / 10) * 100

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3 text-gray-300">
        {icon}
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div className="flex items-end gap-2 mb-2">
        <span className="text-3xl font-bold text-white">{score}</span>
        <span className="text-gray-400 mb-1">/10</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            score >= 8 ? 'bg-green-500' :
            score >= 6 ? 'bg-blue-500' :
            score >= 4 ? 'bg-yellow-500' :
            'bg-red-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
