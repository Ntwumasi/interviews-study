'use client'

import { InterviewType, Scenario } from '@/types'
import { DiagramWorkspace } from './workspaces/diagram-workspace'
import { CodeWorkspace } from './workspaces/code-workspace'
import { BehavioralWorkspace } from './workspaces/behavioral-workspace'

interface InterviewWorkspaceProps {
  interviewId: string
  interviewType: InterviewType
  scenario: Scenario
  onOutputChange?: (output: string) => void
  onRunningChange?: (isRunning: boolean) => void
  onCodeChange?: (code: string) => void
}

export function InterviewWorkspace({
  interviewId,
  interviewType,
  scenario,
  onOutputChange,
  onRunningChange,
  onCodeChange,
}: InterviewWorkspaceProps) {
  switch (interviewType) {
    case 'system_design':
      return <DiagramWorkspace interviewId={interviewId} scenario={scenario} />
    case 'coding':
      return (
        <CodeWorkspace
          interviewId={interviewId}
          scenario={scenario}
          onOutputChange={onOutputChange}
          onRunningChange={onRunningChange}
          onCodeChange={onCodeChange}
        />
      )
    case 'behavioral':
      return <BehavioralWorkspace interviewId={interviewId} scenario={scenario} />
    default:
      return (
        <div className="h-full flex items-center justify-center text-gray-400">
          Unknown interview type
        </div>
      )
  }
}
