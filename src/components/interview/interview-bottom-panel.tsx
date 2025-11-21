'use client'

import { useState } from 'react'
import { MessageSquare, Terminal } from 'lucide-react'
import { InterviewChat } from './interview-chat'
import { TranscriptMessage } from '@/types'

interface InterviewBottomPanelProps {
  transcript: TranscriptMessage[]
  onSendMessage: (message: string) => Promise<void>
  codeOutput?: string
  isRunning?: boolean
  showOutput?: boolean
}

export function InterviewBottomPanel({
  transcript,
  onSendMessage,
  codeOutput = '',
  isRunning = false,
  showOutput = false,
}: InterviewBottomPanelProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'output'>('chat')

  return (
    <div className="h-full flex flex-col bg-black/20 backdrop-blur-xl">
      {/* Tabs */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10 bg-black/30">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'chat'
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Chat
        </button>
        {showOutput && (
          <button
            onClick={() => setActiveTab('output')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'output'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            <Terminal className="h-4 w-4" />
            Output
            {isRunning && (
              <span className="ml-1 h-2 w-2 bg-green-400 rounded-full animate-pulse" />
            )}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'chat' ? (
          <InterviewChat
            transcript={transcript}
            onSendMessage={onSendMessage}
          />
        ) : (
          <div className="h-full overflow-y-auto p-4">
            <pre className="font-mono text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
              {codeOutput || 'Run your code to see output here...'}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
