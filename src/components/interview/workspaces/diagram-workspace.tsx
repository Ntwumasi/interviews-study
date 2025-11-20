'use client'

import { useEffect, useState } from 'react'
import { Pencil, Save } from 'lucide-react'
import '@excalidraw/excalidraw/index.css'

interface DiagramWorkspaceProps {
  interviewId: string
}

export function DiagramWorkspace({ interviewId }: DiagramWorkspaceProps) {
  const [ExcalidrawComponent, setExcalidrawComponent] = useState<any>(null)
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  // Listen for theme changes
  useEffect(() => {
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains('dark')
      setTheme(isDark ? 'dark' : 'light')
    }

    updateTheme()

    // Listen for theme changes
    const observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

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
            console.log('[Diagram] Loaded saved diagram')
          }
        }
      } catch (error) {
        console.error('[Diagram] Failed to load diagram:', error)
      }
    }

    loadDiagram()
  }, [excalidrawAPI, interviewId])

  // Auto-save diagram
  const handleChange = async (elements: any, appState: any) => {
    if (!elements || elements.length === 0) return

    setIsSaving(true)
    try {
      await fetch(`/api/interviews/${interviewId}/diagram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagram: { elements, appState },
        }),
      })
      setLastSaved(new Date())
    } catch (error) {
      console.error('[Diagram] Failed to save:', error)
    } finally {
      setIsSaving(false)
    }
  }

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
      <div className="flex-1 overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
        {ExcalidrawComponent ? (
          <ExcalidrawComponent
            excalidrawAPI={(api: any) => setExcalidrawAPI(api)}
            onChange={handleChange}
            theme={theme}
            initialData={{
              appState: {
                viewBackgroundColor: theme === 'dark' ? '#121212' : '#ffffff',
              },
            }}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-[#121212]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-400">Loading canvas...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
