'use client'

import { useState, useEffect } from 'react'
import { Scenario } from '@/types'

interface BehavioralWorkspaceProps {
  interviewId: string
  scenario: Scenario
}

interface StarResponse {
  situation: string
  task: string
  action: string
  result: string
}

const STAR_SECTIONS = [
  {
    key: 'situation' as const,
    label: 'S',
    title: 'Situation',
    hint: 'Set the scene - describe the context',
    placeholder: 'Describe the situation you were in. What was the context? When and where did this happen?',
  },
  {
    key: 'task' as const,
    label: 'T',
    title: 'Task',
    hint: 'Your responsibility or goal',
    placeholder: 'What was your specific responsibility? What were you trying to achieve?',
  },
  {
    key: 'action' as const,
    label: 'A',
    title: 'Action',
    hint: 'The specific steps you took',
    placeholder: 'What specific actions did YOU take? Focus on "I" not "we". Be detailed about your approach.',
  },
  {
    key: 'result' as const,
    label: 'R',
    title: 'Result',
    hint: 'Outcomes and learnings',
    placeholder: 'What was the outcome? Quantify if possible (%, $, time saved). What did you learn?',
  },
]

export function BehavioralWorkspace({ interviewId, scenario }: BehavioralWorkspaceProps) {
  const [starResponse, setStarResponse] = useState<StarResponse>({
    situation: '',
    task: '',
    action: '',
    result: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [activeSection, setActiveSection] = useState<keyof StarResponse | null>(null)

  // Load saved STAR responses on mount
  useEffect(() => {
    const loadStarResponse = async () => {
      try {
        const response = await fetch(`/api/interviews/${interviewId}/star`)
        if (response.ok) {
          const data = await response.json()
          if (data.starResponse) {
            setStarResponse(data.starResponse)
          }
        }
      } catch (error) {
        console.error('[Behavioral] Failed to load STAR response:', error)
      } finally {
        setIsLoaded(true)
      }
    }

    loadStarResponse()
  }, [interviewId])

  // Auto-save with debouncing
  useEffect(() => {
    // Don't save until we've loaded existing data
    if (!isLoaded) return

    const hasContent = Object.values(starResponse).some(v => v.trim().length > 0)
    if (!hasContent) return

    const saveTimer = setTimeout(async () => {
      setIsSaving(true)
      try {
        await fetch(`/api/interviews/${interviewId}/star`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ starResponse }),
        })
      } catch (error) {
        console.error('[Behavioral] Failed to save:', error)
      } finally {
        setIsSaving(false)
      }
    }, 1000)

    return () => clearTimeout(saveTimer)
  }, [starResponse, interviewId, isLoaded])

  const updateField = (field: keyof StarResponse, value: string) => {
    setStarResponse((prev) => ({ ...prev, [field]: value }))
  }

  // Calculate completion for each section
  const getCompletionStatus = (key: keyof StarResponse) => {
    const value = starResponse[key]
    if (!value || value.trim().length === 0) return 'empty'
    if (value.trim().length < 50) return 'partial'
    return 'complete'
  }

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a]">
      {/* Minimal Toolbar */}
      <div className="flex-shrink-0 h-10 px-3 flex items-center justify-between border-b border-white/[0.06] bg-[#0f0f0f]">
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-gray-300 font-medium">STAR Method</span>
          <div className="flex items-center gap-1">
            {STAR_SECTIONS.map((section) => {
              const status = getCompletionStatus(section.key)
              return (
                <div
                  key={section.key}
                  className={`w-6 h-6 rounded flex items-center justify-center text-[11px] font-semibold transition-colors ${
                    status === 'complete'
                      ? 'bg-green-500/20 text-green-400'
                      : status === 'partial'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-white/[0.06] text-gray-500'
                  }`}
                  title={`${section.title}: ${status}`}
                >
                  {section.label}
                </div>
              )
            })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isSaving && (
            <span className="text-[11px] text-gray-500 animate-pulse">Saving...</span>
          )}
        </div>
      </div>

      {/* STAR Sections */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {STAR_SECTIONS.map((section, index) => {
            const status = getCompletionStatus(section.key)
            const isActive = activeSection === section.key

            return (
              <div
                key={section.key}
                className={`rounded-lg border transition-all ${
                  isActive
                    ? 'border-purple-500/50 bg-purple-500/5'
                    : 'border-white/[0.06] bg-white/[0.02]'
                }`}
              >
                {/* Section Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.04]">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      status === 'complete'
                        ? 'bg-green-500/20 text-green-400'
                        : status === 'partial'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-purple-500/20 text-purple-400'
                    }`}
                  >
                    {section.label}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-medium text-white">{section.title}</h3>
                    <p className="text-[12px] text-gray-500">{section.hint}</p>
                  </div>
                  {status === 'complete' && (
                    <span className="text-[11px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded">
                      Complete
                    </span>
                  )}
                </div>

                {/* Textarea */}
                <textarea
                  value={starResponse[section.key]}
                  onChange={(e) => updateField(section.key, e.target.value)}
                  onFocus={() => setActiveSection(section.key)}
                  onBlur={() => setActiveSection(null)}
                  placeholder={section.placeholder}
                  className="w-full bg-transparent px-4 py-3 text-[14px] text-gray-200 placeholder-gray-600 focus:outline-none resize-none min-h-[100px] leading-relaxed"
                />
              </div>
            )
          })}
        </div>

        {/* Tips Section */}
        <div className="px-4 pb-6">
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
            <h4 className="text-[13px] font-medium text-gray-400 mb-2">Tips for Strong Responses</h4>
            <ul className="space-y-1.5 text-[12px] text-gray-500">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>Use &quot;I&quot; instead of &quot;we&quot; to highlight your specific contributions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>Include specific metrics and numbers where possible</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>Keep each section concise - aim for 2-3 sentences each</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>Focus on recent examples (last 2-3 years)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
