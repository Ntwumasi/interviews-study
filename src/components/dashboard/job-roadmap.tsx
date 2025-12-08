'use client'

import { useState } from 'react'
import {
  Link2,
  FileText,
  Calendar,
  Loader2,
  Target,
  Code2,
  Network,
  MessageSquare,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Building2,
  Briefcase,
  AlertCircle,
} from 'lucide-react'

interface RoadmapTask {
  type: 'study' | 'practice' | 'interview'
  topic: string
  duration: string
  details: string
}

interface DailyPlan {
  day: number
  title: string
  tasks: RoadmapTask[]
}

interface Phase {
  name: string
  days: string
  focus: string
  dailyPlan: DailyPlan[]
}

interface FocusArea {
  weight: number
  topics: string[]
}

interface PracticeInterview {
  type: 'coding' | 'system_design' | 'behavioral'
  difficulty: 'easy' | 'medium' | 'hard'
  topic: string
  when: string
}

interface Resource {
  name: string
  type: 'course' | 'book' | 'website' | 'video'
  url?: string
  topic: string
}

interface Roadmap {
  company: string
  role: string
  level: string
  type: string
  keySkills: string[]
  techStack: string[]
  focusAreas: {
    coding: FocusArea
    systemDesign: FocusArea
    behavioral: FocusArea
  }
  roadmap: {
    totalDays: number
    phases: Phase[]
  }
  practiceInterviews: PracticeInterview[]
  resources: Resource[]
  tips: string[]
}

export function JobRoadmap() {
  const [inputMode, setInputMode] = useState<'url' | 'text'>('url')
  const [jobUrl, setJobUrl] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set([0]))

  const handleGenerate = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/job-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: inputMode === 'url' ? jobUrl : undefined,
          jobDescription: inputMode === 'text' ? jobDescription : undefined,
          targetDate: targetDate || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate roadmap')
      }

      setRoadmap(data.roadmap)
      // Expand first phase by default
      setExpandedPhases(new Set([0]))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const togglePhase = (index: number) => {
    setExpandedPhases(prev => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'coding':
        return <Code2 className="w-4 h-4" />
      case 'system_design':
        return <Network className="w-4 h-4" />
      case 'behavioral':
        return <MessageSquare className="w-4 h-4" />
      default:
        return <Target className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'coding':
        return 'text-blue-400 bg-blue-500/20'
      case 'system_design':
        return 'text-purple-400 bg-purple-500/20'
      case 'behavioral':
        return 'text-emerald-400 bg-emerald-500/20'
      default:
        return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500/20 text-green-400'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'hard':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'study':
        return <BookOpen className="w-3.5 h-3.5 text-blue-400" />
      case 'practice':
        return <Code2 className="w-3.5 h-3.5 text-purple-400" />
      case 'interview':
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
      default:
        return <Target className="w-3.5 h-3.5 text-gray-400" />
    }
  }

  // Min date is today
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Job Interview Roadmap
          </h3>
          <p className="text-sm text-white/50">
            Paste a job URL to get a personalized preparation plan
          </p>
        </div>
      </div>

      {/* Input Section */}
      {!roadmap && (
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 space-y-4">
          {/* Input Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setInputMode('url')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                inputMode === 'url'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'bg-white/[0.03] text-white/50 border border-white/10 hover:bg-white/[0.05]'
              }`}
            >
              <Link2 className="w-4 h-4" />
              Job URL
            </button>
            <button
              onClick={() => setInputMode('text')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                inputMode === 'text'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'bg-white/[0.03] text-white/50 border border-white/10 hover:bg-white/[0.05]'
              }`}
            >
              <FileText className="w-4 h-4" />
              Paste Description
            </button>
          </div>

          {/* Input Field */}
          {inputMode === 'url' ? (
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Job Posting URL
              </label>
              <input
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://linkedin.com/jobs/view/..."
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here..."
                rows={6}
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 resize-none"
              />
            </div>
          )}

          {/* Target Date */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Interview Date (optional)
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              min={today}
              className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500/50"
            />
            <p className="text-xs text-white/40 mt-1">
              We&apos;ll create a timeline to get you ready by this date
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isLoading || (inputMode === 'url' ? !jobUrl : !jobDescription)}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing job posting...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Learning Roadmap
              </>
            )}
          </button>
        </div>
      )}

      {/* Roadmap Display */}
      {roadmap && (
        <div className="space-y-6">
          {/* Job Summary Card */}
          <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-5 h-5 text-purple-400" />
                  <h4 className="text-lg font-semibold text-white">{roadmap.company}</h4>
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <Briefcase className="w-4 h-4" />
                  <span>{roadmap.role}</span>
                  <span className="text-white/30">•</span>
                  <span className="capitalize">{roadmap.level}</span>
                </div>
              </div>
              <button
                onClick={() => setRoadmap(null)}
                className="text-sm text-white/50 hover:text-white transition-colors"
              >
                New Search
              </button>
            </div>

            {/* Tech Stack */}
            <div className="mb-4">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Tech Stack</p>
              <div className="flex flex-wrap gap-2">
                {roadmap.techStack.slice(0, 8).map((tech, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-white/10 rounded-md text-xs text-white/70"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Focus Areas */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
                <Code2 className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-white">{roadmap.focusAreas.coding.weight}%</div>
                <div className="text-xs text-white/50">Coding</div>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-center">
                <Network className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-white">{roadmap.focusAreas.systemDesign.weight}%</div>
                <div className="text-xs text-white/50">System Design</div>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-center">
                <MessageSquare className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-white">{roadmap.focusAreas.behavioral.weight}%</div>
                <div className="text-xs text-white/50">Behavioral</div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                {roadmap.roadmap.totalDays}-Day Preparation Plan
              </h4>
            </div>

            <div className="divide-y divide-white/[0.06]">
              {roadmap.roadmap.phases.map((phase, phaseIndex) => (
                <div key={phaseIndex}>
                  {/* Phase Header */}
                  <button
                    onClick={() => togglePhase(phaseIndex)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {expandedPhases.has(phaseIndex) ? (
                        <ChevronDown className="w-4 h-4 text-white/40" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-white/40" />
                      )}
                      <div className="text-left">
                        <div className="text-sm font-medium text-white">{phase.name}</div>
                        <div className="text-xs text-white/50">{phase.days}</div>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 bg-white/10 rounded text-white/60">
                      {phase.focus}
                    </span>
                  </button>

                  {/* Phase Content */}
                  {expandedPhases.has(phaseIndex) && (
                    <div className="px-6 pb-4 space-y-3">
                      {phase.dailyPlan.map((day, dayIndex) => (
                        <div
                          key={dayIndex}
                          className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-4"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-400">
                              {day.day}
                            </div>
                            <span className="text-sm font-medium text-white">{day.title}</span>
                          </div>
                          <div className="space-y-2 pl-8">
                            {day.tasks.map((task, taskIndex) => (
                              <div
                                key={taskIndex}
                                className="flex items-start gap-2 text-sm"
                              >
                                {getTaskIcon(task.type)}
                                <div className="flex-1">
                                  <span className="text-white/80">{task.topic}</span>
                                  <span className="text-white/40 mx-2">•</span>
                                  <span className="text-white/40">{task.duration}</span>
                                  {task.details && (
                                    <p className="text-xs text-white/40 mt-0.5">{task.details}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Practice Interviews */}
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
            <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              Recommended Practice Interviews
            </h4>
            <div className="grid gap-3 md:grid-cols-2">
              {roadmap.practiceInterviews.map((interview, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getTypeColor(interview.type)}`}>
                    {getTypeIcon(interview.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white">{interview.topic}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${getDifficultyColor(interview.difficulty)}`}>
                        {interview.difficulty}
                      </span>
                    </div>
                    <span className="text-xs text-white/40">{interview.when}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resources */}
          {roadmap.resources.length > 0 && (
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
              <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                Recommended Resources
              </h4>
              <div className="space-y-2">
                {roadmap.resources.slice(0, 6).map((resource, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded capitalize">
                        {resource.type}
                      </span>
                      <span className="text-sm text-white">{resource.name}</span>
                    </div>
                    {resource.url && (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-purple-400 hover:text-purple-300"
                      >
                        Open →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          {roadmap.tips.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Pro Tips for This Role
              </h4>
              <ul className="space-y-2">
                {roadmap.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
