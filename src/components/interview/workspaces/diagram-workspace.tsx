'use client'

import { useEffect, useState, useRef } from 'react'
import '@excalidraw/excalidraw/index.css'
import { Scenario } from '@/types'

interface DiagramWorkspaceProps {
  interviewId: string
  scenario: Scenario
}

export function DiagramWorkspace({ interviewId, scenario }: DiagramWorkspaceProps) {
  const [ExcalidrawComponent, setExcalidrawComponent] = useState<any>(null)
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [elementCount, setElementCount] = useState(0)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load Excalidraw dynamically
  useEffect(() => {
    import('@excalidraw/excalidraw').then((module) => {
      setExcalidrawComponent(() => module.Excalidraw)
    })
  }, [])

  // Load saved diagram when API is ready
  useEffect(() => {
    if (!excalidrawAPI) return

    const loadDiagram = async () => {
      try {
        const response = await fetch(`/api/interviews/${interviewId}/diagram`)
        if (response.ok) {
          const data = await response.json()
          if (data.diagram && data.diagram.elements) {
            excalidrawAPI.updateScene(data.diagram)
            setElementCount(data.diagram.elements.length)
            console.log('[Diagram] Loaded saved diagram')
          }
        }
      } catch (error) {
        console.error('[Diagram] Failed to load diagram:', error)
      }
    }

    loadDiagram()
  }, [excalidrawAPI, interviewId])

  // Auto-save diagram with debouncing
  const handleChange = async (elements: any, appState: any) => {
    setElementCount(elements?.length || 0)

    if (!elements || elements.length === 0) return

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Debounce save
    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true)
      try {
        await fetch(`/api/interviews/${interviewId}/diagram`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            diagram: { elements, appState },
          }),
        })
      } catch (error) {
        console.error('[Diagram] Failed to save:', error)
      } finally {
        setIsSaving(false)
      }
    }, 1000)
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a] overflow-hidden relative">
      {/* Minimal Toolbar */}
      <div className="flex-shrink-0 h-10 px-3 flex items-center justify-between border-b border-white/[0.06] bg-[#0f0f0f]">
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-gray-300 font-medium">System Design</span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-500">
              {elementCount} {elementCount === 1 ? 'element' : 'elements'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isSaving && (
            <span className="text-[11px] text-gray-500 animate-pulse">Saving...</span>
          )}
        </div>
      </div>

      {/* Excalidraw Canvas - Full Height */}
      <div className="flex-1 overflow-hidden">
        {ExcalidrawComponent ? (
          <ExcalidrawComponent
            excalidrawAPI={(api: any) => setExcalidrawAPI(api)}
            onChange={handleChange}
            theme="dark"
            initialData={{
              appState: {
                viewBackgroundColor: '#1a1a1a',
                currentItemFontFamily: 1,
                gridSize: null,
              },
            }}
            UIOptions={{
              canvasActions: {
                changeViewBackgroundColor: false,
                clearCanvas: true,
                export: false,
                loadScene: false,
                saveToActiveFile: false,
                toggleTheme: false,
                saveAsImage: false,
              },
            }}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-[#1a1a1a]">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-[13px] text-gray-500">Loading canvas...</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Tips Overlay - Bottom Left */}
      <div className="absolute bottom-4 left-4 max-w-xs">
        <div className="bg-black/80 backdrop-blur-sm rounded-lg border border-white/[0.08] p-3 text-[11px] text-gray-400 space-y-1">
          <p className="text-gray-300 font-medium mb-1.5">Quick Tips</p>
          <p>• Start with high-level components (Client, Server, DB)</p>
          <p>• Use arrows to show data flow direction</p>
          <p>• Label connections with protocols (HTTP, WebSocket)</p>
          <p>• Press <kbd className="px-1 py-0.5 bg-white/10 rounded text-[10px]">R</kbd> for rectangle, <kbd className="px-1 py-0.5 bg-white/10 rounded text-[10px]">A</kbd> for arrow</p>
        </div>
      </div>
    </div>
  )
}
