'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { TranscriptMessage } from '@/types'
import { Send, Volume2, VolumeX, Mic, Bot, Play } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { toast } from 'sonner'

interface InterviewChatProps {
  transcript: TranscriptMessage[]
  onSendMessage: (message: string) => void
  isAISpeaking?: boolean
}

export function InterviewChat({ transcript, onSendMessage, isAISpeaking = false }: InterviewChatProps) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [audioBlocked, setAudioBlocked] = useState(false)
  const [pendingAudioText, setPendingAudioText] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const lastMessageCountRef = useRef(0)
  const recognitionRef = useRef<any>(null)
  const hasShownAudioBlockedToast = useRef(false)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        setSpeechSupported(true)
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result) => result.transcript)
            .join('')

          setInput(transcript)
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognition.onerror = (event: any) => {
          console.error('[Speech] Recognition error:', event.error)
          setIsListening(false)
        }

        recognitionRef.current = recognition
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [transcript])

  // Play voice for new AI messages
  useEffect(() => {
    if (!voiceEnabled || transcript.length === 0) return

    // Check if there's a new AI message
    if (transcript.length > lastMessageCountRef.current) {
      const lastMessage = transcript[transcript.length - 1]

      if (lastMessage.role === 'assistant') {
        playVoice(lastMessage.content)
      }
    }

    lastMessageCountRef.current = transcript.length
  }, [transcript, voiceEnabled])

  const playVoice = useCallback(async (text: string, isRetry: boolean = false) => {
    try {
      setIsSpeaking(true)

      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        console.warn('[Voice] TTS service unavailable')
        setIsSpeaking(false)
        return
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      if (audioRef.current) {
        audioRef.current.pause()
      }

      const audio = new Audio(audioUrl)
      audioRef.current = audio

      audio.onended = () => {
        setIsSpeaking(false)
        setAudioBlocked(false)
        setPendingAudioText(null)
        URL.revokeObjectURL(audioUrl)
      }

      audio.onerror = (e) => {
        console.error('[Voice] Audio playback error:', e)
        setIsSpeaking(false)
        URL.revokeObjectURL(audioUrl)
      }

      // Try to play audio
      const playPromise = audio.play()

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Audio started playing successfully
            setAudioBlocked(false)
            setPendingAudioText(null)
          })
          .catch((error) => {
            console.warn('[Voice] Autoplay blocked:', error.message)
            setIsSpeaking(false)
            URL.revokeObjectURL(audioUrl)

            // Only show toast once per session
            if (error.name === 'NotAllowedError' && !hasShownAudioBlockedToast.current) {
              hasShownAudioBlockedToast.current = true
              setAudioBlocked(true)
              setPendingAudioText(text)

              toast('Voice is ready', {
                description: 'Click the play button to hear the AI interviewer',
                duration: 5000,
                icon: '🔊',
              })
            }
          })
      }
    } catch (error) {
      console.error('[Voice] Error playing audio:', error)
      setIsSpeaking(false)
    }
  }, [])

  const toggleVoice = () => {
    if (voiceEnabled && audioRef.current) {
      audioRef.current.pause()
      setIsSpeaking(false)
    }
    setVoiceEnabled(!voiceEnabled)
  }

  // Manual play for when autoplay is blocked
  const handleManualPlay = useCallback(() => {
    if (pendingAudioText) {
      setAudioBlocked(false)
      playVoice(pendingAudioText, true)
    }
  }, [pendingAudioText, playVoice])

  const toggleMicrophone = () => {
    if (!speechSupported || !recognitionRef.current) {
      console.warn('[Speech] Speech recognition not supported')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (error) {
        console.error('[Speech] Failed to start recognition:', error)
        setIsListening(false)
      }
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [input])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isLoading) return

    const message = input.trim()
    setInput('')
    setIsLoading(true)

    try {
      await onSendMessage(message)
    } finally {
      setIsLoading(false)
      textareaRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          {transcript.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar - Only for AI */}
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white rounded-2xl rounded-tr-md px-4 py-2.5'
                    : 'text-gray-200'
                }`}
              >
                {message.role === 'assistant' ? (
                  <div className="prose prose-sm prose-invert max-w-none prose-p:leading-relaxed prose-p:my-1.5 prose-headings:text-white prose-strong:text-white prose-code:text-blue-300 prose-code:bg-white/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {(isLoading || isAISpeaking) && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-center gap-1.5 py-2">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 p-3 border-t border-white/[0.06]">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question or share your thoughts..."
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-4 pr-24 py-3 text-[14px] text-white placeholder-gray-500 focus:outline-none focus:border-white/20 resize-none min-h-[48px] max-h-[120px] transition-colors"
            disabled={isLoading}
            rows={1}
          />

          {/* Right side controls */}
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            {/* Play button when audio is blocked */}
            {audioBlocked && pendingAudioText && (
              <button
                type="button"
                onClick={handleManualPlay}
                className="h-8 px-3 flex items-center gap-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white transition-colors animate-pulse"
                title="Play AI voice"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span className="text-[12px] font-medium">Play</span>
              </button>
            )}

            {/* Voice toggle */}
            <button
              type="button"
              onClick={toggleVoice}
              className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${
                voiceEnabled
                  ? isSpeaking ? 'text-green-400 bg-green-500/10' : 'text-blue-400 hover:bg-blue-500/10'
                  : 'text-gray-500 hover:bg-white/5'
              }`}
              title={voiceEnabled ? (isSpeaking ? 'Speaking...' : 'Mute AI voice') : 'Unmute AI voice'}
            >
              {voiceEnabled ? <Volume2 className={`h-4 w-4 ${isSpeaking ? 'animate-pulse' : ''}`} /> : <VolumeX className="h-4 w-4" />}
            </button>

            {/* Mic / Send button */}
            {input.trim() ? (
              <button
                type="submit"
                disabled={isLoading}
                className="h-8 w-8 flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={toggleMicrophone}
                disabled={!speechSupported}
                className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${
                  isListening
                    ? 'bg-red-500/20 text-red-400'
                    : 'hover:bg-white/5 text-gray-400 hover:text-white'
                } disabled:opacity-30`}
                title={isListening ? 'Stop listening' : 'Use voice input'}
              >
                <Mic className={`h-4 w-4 ${isListening ? 'animate-pulse' : ''}`} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
