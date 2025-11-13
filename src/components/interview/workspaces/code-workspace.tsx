'use client'

import { useState, useEffect } from 'react'
import { Code2, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'

// Dynamically import Monaco Editor to avoid SSR issues
const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

interface CodeWorkspaceProps {
  interviewId: string
}

export function CodeWorkspace({ interviewId }: CodeWorkspaceProps) {
  const [code, setCode] = useState('// Write your code here\n\n')
  const [language, setLanguage] = useState('javascript')
  const [isSaving, setIsSaving] = useState(false)
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)

  // Load saved code on mount
  useEffect(() => {
    const loadCode = async () => {
      try {
        const response = await fetch(`/api/interviews/${interviewId}/code`)
        if (response.ok) {
          const data = await response.json()
          if (data.code) {
            setCode(data.code)
          }
          if (data.language) {
            setLanguage(data.language)
          }
        }
      } catch (error) {
        console.error('[Code] Failed to load code:', error)
      }
    }
    loadCode()
  }, [interviewId])

  // Auto-save code with debouncing
  useEffect(() => {
    const saveTimer = setTimeout(async () => {
      if (code === '// Write your code here\n\n') {
        return // Don't save default placeholder
      }

      setIsSaving(true)
      try {
        await fetch(`/api/interviews/${interviewId}/code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, language }),
        })
      } catch (error) {
        console.error('[Code] Failed to save code:', error)
      } finally {
        setIsSaving(false)
      }
    }, 1000) // Save 1 second after user stops typing

    return () => clearTimeout(saveTimer)
  }, [code, language, interviewId])

  const handleRun = async () => {
    setIsRunning(true)
    setOutput('Running code...')

    try {
      const response = await fetch('/api/execute-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      })

      const data = await response.json()

      if (response.ok) {
        setOutput(data.output || 'No output')
      } else {
        setOutput(`Error: ${data.error || 'Failed to execute code'}`)
      }
    } catch (error) {
      console.error('[Code] Failed to execute:', error)
      setOutput('Error: Failed to execute code. Please try again.')
    } finally {
      setIsRunning(false)
    }
  }

  const handleCodeChange = (value: string | undefined) => {
    setCode(value || '')
  }

  return (
    <div className="h-full flex flex-col bg-[#0A0A0A]">
      <div className="border-b border-white/10 px-4 py-3 bg-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-green-400" />
            <h3 className="text-sm font-semibold text-white">Code Editor</h3>
            {isSaving && (
              <span className="text-xs text-gray-400">Saving...</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="go">Go</option>
            </select>
            <Button
              size="sm"
              onClick={handleRun}
              disabled={isRunning}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="h-4 w-4 mr-1" />
              {isRunning ? 'Running...' : 'Run'}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Monaco Code Editor */}
        <div className="flex-1 min-h-0">
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={handleCodeChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
            }}
          />
        </div>

        {/* Output Panel - Larger and expandable */}
        <div className="border-t border-white/10 bg-white/5 p-4 h-64 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 mb-2">OUTPUT</div>
          <pre className="font-mono text-sm text-gray-300 whitespace-pre-wrap">
            {output || 'Run your code to see output here...'}
          </pre>
        </div>
      </div>
    </div>
  )
}
