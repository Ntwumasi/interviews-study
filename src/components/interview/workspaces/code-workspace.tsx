'use client'

import { useState } from 'react'
import { Code2, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CodeWorkspaceProps {
  interviewId: string
}

export function CodeWorkspace({ interviewId }: CodeWorkspaceProps) {
  const [code, setCode] = useState('// Write your code here\n\n')
  const [language, setLanguage] = useState('javascript')

  const handleRun = () => {
    // TODO: Implement code execution
    console.log('Running code:', code)
  }

  return (
    <div className="h-full flex flex-col bg-[#0A0A0A]">
      <div className="border-b border-white/10 px-4 py-3 bg-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-green-400" />
            <h3 className="text-sm font-semibold text-white">Code Editor</h3>
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
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="h-4 w-4 mr-1" />
              Run
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Code Editor */}
        <div className="flex-1 p-4">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-full bg-[#1E1E1E] text-gray-200 font-mono text-sm p-4 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            spellCheck={false}
          />
        </div>

        {/* Output Panel */}
        <div className="border-t border-white/10 bg-white/5 p-4 h-32">
          <div className="text-xs font-semibold text-gray-400 mb-2">OUTPUT</div>
          <div className="font-mono text-sm text-gray-300">
            <p className="text-gray-500">Code execution coming soon...</p>
            <p className="text-xs text-gray-600 mt-2">
              Monaco Editor and code execution engine will be integrated here
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
