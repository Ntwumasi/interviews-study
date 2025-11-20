'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Pencil, Save } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import Excalidraw to avoid SSR issues
const Excalidraw = dynamic(
  async () => (await import('@excalidraw/excalidraw')).Excalidraw,
  { ssr: false, loading: () => <div className="h-full flex items-center justify-center bg-[#121212] text-gray-400">Loading canvas...</div> }
)

interface DiagramWorkspaceProps {
  interviewId: string
}

export function DiagramWorkspace({ interviewId }: DiagramWorkspaceProps) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Load saved diagram on mount
  useEffect(() => {
    const loadDiagram = async () => {
      try {
        const response = await fetch(`/api/interviews/${interviewId}/diagram`)
        if (response.ok) {
          const data = await response.json()
          if (data.diagram && excalidrawAPI) {
            excalidrawAPI.updateScene(data.diagram)
            console.log('[Diagram] Loaded saved diagram')
          }
        }
      } catch (error) {
        console.error('[Diagram] Failed to load diagram:', error)
      }
    }

    if (excalidrawAPI) {
      loadDiagram()
    }
  }, [interviewId, excalidrawAPI])

  // Auto-save diagram with debouncing
  const saveDiagram = useCallback(async (elements: any, appState: any) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }

    saveTimerRef.current = setTimeout(async () => {
      if (!elements || elements.length === 0) {
        return // Don't save empty diagrams
      }

      setIsSaving(true)
      try {
        await fetch(`/api/interviews/${interviewId}/diagram`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            diagram: {
              elements,
              appState,
            },
          }),
        })
        setLastSaved(new Date())
        console.log('[Diagram] Auto-saved')
      } catch (error) {
        console.error('[Diagram] Failed to save diagram:', error)
      } finally {
        setIsSaving(false)
      }
    }, 2000) // Save 2 seconds after user stops drawing
  }, [interviewId])

  // Handle Excalidraw changes
  const handleChange = useCallback((elements: any, appState: any) => {
    saveDiagram(elements, appState)
  }, [saveDiagram])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
    }
  }, [])

  return (
    <div className="h-full flex flex-col bg-[#0A0A0A] overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-white/10 px-4 py-3 bg-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pencil className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">System Design Diagram</h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {isSaving ? (
              <>
                <Save className="h-3 w-3 animate-pulse" />
                <span>Saving...</span>
              </>
            ) : lastSaved ? (
              <>
                <Save className="h-3 w-3" />
                <span>Saved {lastSaved.toLocaleTimeString()}</span>
              </>
            ) : (
              <span>Draw your architecture</span>
            )}
          </div>
        </div>
      </div>

      {/* Excalidraw Canvas */}
      <div className="flex-1 min-h-0">
        <Excalidraw
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          onChange={handleChange}
          theme="dark"
          UIOptions={{
            canvasActions: {
              loadScene: false,
              saveToActiveFile: false,
              export: false,
              toggleTheme: false,
            },
          }}
          initialData={{
            appState: {
              viewBackgroundColor: '#0A0A0A',
              currentItemFontFamily: 1,
            },
          }}
        />
      </div>
    </div>
  )
}
