'use client'

import { useRef, useState, useEffect } from 'react'
import MuxPlayer from '@mux/mux-player-react'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize } from 'lucide-react'

interface TranscriptMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: number
}

interface InterviewPlayerProps {
  playbackId: string
  transcript?: TranscriptMessage[]
  duration?: number
  title?: string
}

export function InterviewPlayer({
  playbackId,
  transcript = [],
  duration,
  title
}: InterviewPlayerProps) {
  const playerRef = useRef<any>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeMessageIndex, setActiveMessageIndex] = useState(-1)

  // Update active transcript message based on current time
  useEffect(() => {
    if (!transcript.length) return

    // Find the message that corresponds to current time
    let activeIndex = -1
    for (let i = 0; i < transcript.length; i++) {
      const msg = transcript[i]
      if (msg.timestamp !== undefined && msg.timestamp <= currentTime) {
        activeIndex = i
      }
    }
    setActiveMessageIndex(activeIndex)
  }, [currentTime, transcript])

  const handleTimeUpdate = (event: any) => {
    setCurrentTime(event.target.currentTime)
  }

  const handlePlay = () => setIsPlaying(true)
  const handlePause = () => setIsPlaying(false)

  const seekToMessage = (index: number) => {
    const message = transcript[index]
    if (message.timestamp !== undefined && playerRef.current) {
      playerRef.current.currentTime = message.timestamp
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6 h-full">
      {/* Video Player */}
      <div className="flex flex-col">
        <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
          <MuxPlayer
            ref={playerRef}
            playbackId={playbackId}
            metadata={{
              video_title: title || 'Interview Recording',
            }}
            accentColor="#3b82f6"
            onTimeUpdate={handleTimeUpdate}
            onPlay={handlePlay}
            onPause={handlePause}
            className="w-full h-full"
          />
        </div>

        {/* Video Info */}
        <div className="mt-4">
          <h2 className="text-xl font-semibold text-white">
            {title || 'Interview Recording'}
          </h2>
          {duration && (
            <p className="text-gray-400 text-sm mt-1">
              Duration: {formatTime(duration)}
            </p>
          )}
        </div>

        {/* Playback Tips */}
        <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
          <h3 className="text-sm font-medium text-white mb-2">Review Tips</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>- Watch your body language and eye contact</li>
            <li>- Notice filler words (&quot;um&quot;, &quot;like&quot;, &quot;you know&quot;)</li>
            <li>- Check your pacing - are you rushing?</li>
            <li>- Click on transcript messages to jump to that moment</li>
          </ul>
        </div>
      </div>

      {/* Synced Transcript */}
      <div className="flex flex-col h-full">
        <h3 className="text-lg font-semibold text-white mb-4">Interview Transcript</h3>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 max-h-[600px]">
          {transcript.length === 0 ? (
            <p className="text-gray-500 text-sm">No transcript available</p>
          ) : (
            transcript.map((message, index) => (
              <button
                key={index}
                onClick={() => seekToMessage(index)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  index === activeMessageIndex
                    ? 'bg-blue-500/20 border border-blue-500/50 ring-2 ring-blue-500/30'
                    : 'bg-white/5 border border-transparent hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-medium ${
                    message.role === 'assistant' ? 'text-blue-400' : 'text-green-400'
                  }`}>
                    {message.role === 'assistant' ? 'AI Interviewer' : 'You'}
                  </span>
                  {message.timestamp !== undefined && (
                    <span className="text-xs text-gray-500">
                      {formatTime(message.timestamp)}
                    </span>
                  )}
                </div>
                <p className={`text-sm ${
                  index === activeMessageIndex ? 'text-white' : 'text-gray-300'
                }`}>
                  {message.content.length > 200
                    ? message.content.substring(0, 200) + '...'
                    : message.content
                  }
                </p>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
