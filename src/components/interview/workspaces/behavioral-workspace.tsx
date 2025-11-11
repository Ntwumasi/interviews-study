'use client'

import { useState } from 'react'
import { MessageSquare, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface BehavioralWorkspaceProps {
  interviewId: string
}

interface StarResponse {
  situation: string
  task: string
  action: string
  result: string
}

export function BehavioralWorkspace({ interviewId }: BehavioralWorkspaceProps) {
  const [starResponse, setStarResponse] = useState<StarResponse>({
    situation: '',
    task: '',
    action: '',
    result: '',
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // TODO: Save STAR response to database
      console.log('Saving STAR response:', starResponse)
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate save
    } catch (error) {
      console.error('Failed to save STAR response:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const updateField = (field: keyof StarResponse, value: string) => {
    setStarResponse((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="h-full flex flex-col bg-[#0A0A0A]">
      <div className="border-b border-white/10 px-4 py-3 bg-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">STAR Method Notes</h3>
          </div>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Save className="h-4 w-4 mr-1" />
            {isSaving ? 'Saving...' : 'Save Notes'}
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Structure your response using the STAR framework
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Situation */}
        <div className="space-y-2">
          <Label htmlFor="situation" className="text-sm font-semibold text-white">
            Situation
          </Label>
          <p className="text-xs text-gray-400">
            Describe the context and background of the situation
          </p>
          <textarea
            id="situation"
            value={starResponse.situation}
            onChange={(e) => updateField('situation', e.target.value)}
            placeholder="What was the context? Where did this happen?"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none min-h-[100px]"
          />
        </div>

        {/* Task */}
        <div className="space-y-2">
          <Label htmlFor="task" className="text-sm font-semibold text-white">
            Task
          </Label>
          <p className="text-xs text-gray-400">
            Explain what your responsibility or goal was
          </p>
          <textarea
            id="task"
            value={starResponse.task}
            onChange={(e) => updateField('task', e.target.value)}
            placeholder="What were you trying to achieve? What was your role?"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none min-h-[100px]"
          />
        </div>

        {/* Action */}
        <div className="space-y-2">
          <Label htmlFor="action" className="text-sm font-semibold text-white">
            Action
          </Label>
          <p className="text-xs text-gray-400">
            Detail the specific steps you took to address the task
          </p>
          <textarea
            id="action"
            value={starResponse.action}
            onChange={(e) => updateField('action', e.target.value)}
            placeholder="What specific actions did you take? How did you approach it?"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none min-h-[120px]"
          />
        </div>

        {/* Result */}
        <div className="space-y-2">
          <Label htmlFor="result" className="text-sm font-semibold text-white">
            Result
          </Label>
          <p className="text-xs text-gray-400">
            Share the outcomes and what you learned
          </p>
          <textarea
            id="result"
            value={starResponse.result}
            onChange={(e) => updateField('result', e.target.value)}
            placeholder="What was the outcome? What did you learn? Include metrics if possible."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none min-h-[100px]"
          />
        </div>
      </div>
    </div>
  )
}
