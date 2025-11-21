'use client'

import { useEffect, useState } from 'react'
import { Bot } from 'lucide-react'

interface AIInterviewerAvatarProps {
  isSpeaking?: boolean
  interviewType: 'coding' | 'system_design' | 'behavioral'
}

export function AIInterviewerAvatar({ isSpeaking, interviewType }: AIInterviewerAvatarProps) {
  const [pulseAnimation, setPulseAnimation] = useState(false)

  useEffect(() => {
    if (isSpeaking) {
      setPulseAnimation(true)
    } else {
      const timeout = setTimeout(() => setPulseAnimation(false), 300)
      return () => clearTimeout(timeout)
    }
  }, [isSpeaking])

  // Color scheme based on interview type
  const colors = {
    coding: {
      gradient: 'from-blue-500 to-blue-600',
      glow: 'shadow-blue-500/50',
      ring: 'ring-blue-500/30',
      bg: 'bg-blue-500/10',
    },
    system_design: {
      gradient: 'from-purple-500 to-purple-600',
      glow: 'shadow-purple-500/50',
      ring: 'ring-purple-500/30',
      bg: 'bg-purple-500/10',
    },
    behavioral: {
      gradient: 'from-green-500 to-green-600',
      glow: 'shadow-green-500/50',
      ring: 'ring-green-500/30',
      bg: 'bg-green-500/10',
    },
  }

  const color = colors[interviewType]

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg overflow-hidden border border-white/10">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* AI Avatar */}
      <div className="relative w-full h-full flex items-center justify-center">
        <div className={`relative ${pulseAnimation ? 'animate-pulse' : ''}`}>
          {/* Glow Effect */}
          <div className={`absolute inset-0 bg-gradient-to-r ${color.gradient} opacity-20 blur-3xl rounded-full`} />

          {/* Avatar Circle */}
          <div className={`relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-br ${color.gradient} shadow-2xl ${color.glow} flex items-center justify-center ring-4 ${color.ring}`}>
            {/* Inner Circle */}
            <div className={`w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full ${color.bg} backdrop-blur-sm flex items-center justify-center`}>
              <Bot className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-white" />
            </div>
          </div>

          {/* Speaking Animation - Rings */}
          {isSpeaking && (
            <>
              <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${color.gradient} opacity-30 animate-ping`} />
              <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${color.gradient} opacity-20 animate-ping`} style={{ animationDelay: '0.3s' }} />
            </>
          )}
        </div>

        {/* AI Label */}
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/10">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${color.gradient} ${isSpeaking ? 'animate-pulse' : ''}`} />
            <span className="text-white text-sm font-medium">Kingsley St Patrick</span>
          </div>
        </div>

        {/* Speaking Indicator */}
        {isSpeaking && (
          <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/10">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className={`w-1 h-3 bg-gradient-to-t ${color.gradient} rounded-full animate-pulse`} />
                <div className={`w-1 h-4 bg-gradient-to-t ${color.gradient} rounded-full animate-pulse`} style={{ animationDelay: '0.1s' }} />
                <div className={`w-1 h-5 bg-gradient-to-t ${color.gradient} rounded-full animate-pulse`} style={{ animationDelay: '0.2s' }} />
                <div className={`w-1 h-4 bg-gradient-to-t ${color.gradient} rounded-full animate-pulse`} style={{ animationDelay: '0.3s' }} />
                <div className={`w-1 h-3 bg-gradient-to-t ${color.gradient} rounded-full animate-pulse`} style={{ animationDelay: '0.4s' }} />
              </div>
              <span className="text-white text-xs">Speaking...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
