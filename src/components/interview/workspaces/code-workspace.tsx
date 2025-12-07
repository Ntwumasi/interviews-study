'use client'

import { useState, useEffect } from 'react'
import { Play, Command, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import dynamic from 'next/dynamic'
import { Scenario } from '@/types'

// Dynamically import Monaco Editor to avoid SSR issues
const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

interface CodeWorkspaceProps {
  interviewId: string
  scenario: Scenario
  onOutputChange?: (output: string) => void
  onRunningChange?: (isRunning: boolean) => void
  onCodeChange?: (code: string) => void
}

// Generic starter templates per language
const getStarterTemplate = (language: string): string => {
  const templates: Record<string, string> = {
    javascript: `// Write your solution below

function solution() {
  // Your code here

}

// Test your solution
// console.log(solution())
`,
    python: `# Write your solution below

def solution():
    # Your code here
    pass

# Test your solution
# print(solution())
`,
    java: `class Solution {
    public void solution() {
        // Your code here

    }

    public static void main(String[] args) {
        Solution sol = new Solution();
        // Test your solution
    }
}
`,
    cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

class Solution {
public:
    void solution() {
        // Your code here

    }
};

int main() {
    Solution sol;
    // Test your solution
    return 0;
}
`,
    go: `package main

import "fmt"

func solution() {
    // Your code here

}

func main() {
    // Test your solution
    solution()
    fmt.Println("Done")
}
`,
  }
  return templates[language] || templates.javascript
}

export function CodeWorkspace({ interviewId, scenario, onOutputChange, onRunningChange, onCodeChange }: CodeWorkspaceProps) {
  const [code, setCode] = useState(getStarterTemplate('javascript'))
  const [language, setLanguage] = useState('javascript')
  const [isProblemExpanded, setIsProblemExpanded] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [theme] = useState<'vs-dark'>('vs-dark')

  // Handle language change - update template if user hasn't written custom code
  const handleLanguageChange = (newLanguage: string) => {
    const isDefaultCode = ['javascript', 'python', 'java', 'cpp', 'go'].some(
      lang => code.trim() === getStarterTemplate(lang).trim()
    )
    setLanguage(newLanguage)
    if (isDefaultCode) {
      setCode(getStarterTemplate(newLanguage))
    }
  }

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
      // Don't save default templates
      const isDefaultCode = ['javascript', 'python', 'java', 'cpp', 'go'].some(
        lang => code.trim() === getStarterTemplate(lang).trim()
      )
      if (isDefaultCode) {
        return
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
    onRunningChange?.(true)
    onOutputChange?.('Running code...')

    try {
      const response = await fetch('/api/execute-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      })

      const data = await response.json()

      if (response.ok) {
        onOutputChange?.(data.output || 'No output')
      } else {
        onOutputChange?.(`Error: ${data.error || 'Failed to execute code'}`)
      }
    } catch (error) {
      console.error('[Code] Failed to execute:', error)
      onOutputChange?.('Error: Failed to execute code. Please try again.')
    } finally {
      onRunningChange?.(false)
    }
  }

  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || ''
    setCode(newCode)
    onCodeChange?.(newCode)
  }

  return (
    <div className="h-full w-full flex bg-[#1a1a1a]">
      {/* Left: Problem Panel */}
      <div className={`flex-shrink-0 border-r border-white/[0.06] bg-[#0a0a0a] transition-all duration-200 ${isProblemExpanded ? 'w-[340px]' : 'w-10'}`}>
        {isProblemExpanded ? (
          <div className="h-full flex flex-col">
            {/* Problem Header */}
            <div className="flex-shrink-0 h-10 px-3 flex items-center justify-between border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-gray-500" />
                <span className="text-[12px] font-medium text-gray-400 uppercase tracking-wider">Problem</span>
              </div>
              <button
                onClick={() => setIsProblemExpanded(false)}
                className="p-1 hover:bg-white/[0.06] rounded transition-colors"
              >
                <ChevronDown className="h-3.5 w-3.5 text-gray-500 rotate-90" />
              </button>
            </div>

            {/* Problem Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <h2 className="text-[15px] font-semibold text-white mb-1">{scenario.title}</h2>
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                  scenario.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                  scenario.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {scenario.difficulty.charAt(0).toUpperCase() + scenario.difficulty.slice(1)}
                </span>
              </div>
              <div className="text-[13px] text-gray-300 leading-relaxed whitespace-pre-wrap">
                {scenario.prompt || scenario.description}
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsProblemExpanded(true)}
            className="h-full w-full flex items-center justify-center hover:bg-white/[0.04] transition-colors"
          >
            <ChevronUp className="h-4 w-4 text-gray-500 rotate-90" />
          </button>
        )}
      </div>

      {/* Right: Code Editor */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Minimal Toolbar */}
        <div className="flex-shrink-0 h-10 px-3 flex items-center justify-between border-b border-white/[0.06] bg-[#0f0f0f]">
          {/* Left: Language selector */}
          <div className="flex items-center gap-3">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="h-7 px-2.5 bg-white/[0.06] border-0 rounded-md text-[13px] text-gray-300 focus:outline-none focus:ring-1 focus:ring-white/20 cursor-pointer hover:bg-white/[0.08] transition-colors appearance-none pr-7"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center', backgroundSize: '14px' }}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="go">Go</option>
            </select>
            {isSaving && (
              <span className="text-[11px] text-gray-500 animate-pulse">Saving...</span>
            )}
          </div>

          {/* Right: Run button with keyboard hint */}
          <button
            onClick={handleRun}
            className="h-7 px-3 flex items-center gap-2 bg-green-600/90 hover:bg-green-600 text-white text-[13px] font-medium rounded-md transition-colors"
          >
            <Play className="h-3 w-3 fill-current" />
            <span>Run</span>
            <kbd className="hidden sm:inline-flex h-4 px-1.5 items-center gap-0.5 rounded bg-white/20 text-[10px] font-medium">
              <Command className="h-2.5 w-2.5" />
              <span>↵</span>
            </kbd>
          </button>
        </div>

        {/* Monaco Code Editor - Full Height */}
        <div className="flex-1 min-h-0">
          <Editor
            height="100%"
            width="100%"
            language={language}
            value={code}
            onChange={handleCodeChange}
            theme={theme}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'SF Mono', 'Fira Code', 'Monaco', monospace",
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
              padding: { top: 16, bottom: 16 },
              lineHeight: 22,
              renderLineHighlight: 'line',
              cursorBlinking: 'smooth',
              smoothScrolling: true,
              folding: true,
              bracketPairColorization: { enabled: true },
            }}
          />
        </div>
      </div>
    </div>
  )
}
