'use client'

import { InterviewType } from '@/types'
import { DiagramWorkspace } from './workspaces/diagram-workspace'
import { CodeWorkspace } from './workspaces/code-workspace'
import { BehavioralWorkspace } from './workspaces/behavioral-workspace'

interface InterviewWorkspaceProps {
  interviewId: string
  interviewType: InterviewType
}

export function InterviewWorkspace({ interviewId, interviewType }: InterviewWorkspaceProps) {
  switch (interviewType) {
    case 'system_design':
      return <DiagramWorkspace interviewId={interviewId} />
    case 'coding':
      return <CodeWorkspace interviewId={interviewId} />
    case 'behavioral':
      return <BehavioralWorkspace interviewId={interviewId} />
    default:
      return (
        <div className="h-full flex items-center justify-center text-gray-400">
          Unknown interview type
        </div>
      )
  }
}
