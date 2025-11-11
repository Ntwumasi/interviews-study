'use client'

import { useEffect, useState } from 'react'
import { Pencil } from 'lucide-react'

interface DiagramWorkspaceProps {
  interviewId: string
}

export function DiagramWorkspace({ interviewId }: DiagramWorkspaceProps) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: Initialize Excalidraw here
    // For now, just show placeholder
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-gray-400">Loading diagram canvas...</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-[#0A0A0A]">
      <div className="border-b border-white/10 px-4 py-3 bg-white/5">
        <div className="flex items-center gap-2">
          <Pencil className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">System Design Diagram</h3>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Draw your system architecture here (Excalidraw integration coming soon)
        </p>
      </div>

      <div className="flex-1 p-4">
        <div className="h-full border-2 border-dashed border-white/10 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Pencil className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Diagram Canvas</p>
            <p className="text-sm mt-2">Excalidraw integration coming soon</p>
            <p className="text-xs mt-4 max-w-md">
              This will be an interactive whiteboard where you can draw your system design diagrams,
              flowcharts, and architecture diagrams in real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
