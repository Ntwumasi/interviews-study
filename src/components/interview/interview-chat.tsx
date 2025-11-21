'use client'

import { useEffect, useRef, useState } from 'react'
import { TranscriptMessage } from '@/types'
import { Button } from '@/components/ui/button'
import { Send, Volume2, VolumeX, Mic, MicOff, MessageSquare } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface InterviewChatProps {
  transcript: TranscriptMessage[]
  onSendMessage: (message: string) => void
  aiVoiceMuted?: boolean
}

export function InterviewChat({ transcript, onSendMessage, aiVoiceMuted = false }: InterviewChatProps) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const lastMessageCountRef = useRef(0)
  const recognitionRef = useRef<any>(null)

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
    if (!voiceEnabled || aiVoiceMuted || transcript.length === 0) return

    // Check if there's a new AI message
    if (transcript.length > lastMessageCountRef.current) {
      const lastMessage = transcript[transcript.length - 1]

      if (lastMessage.role === 'assistant') {
        playVoice(lastMessage.content)
      }
    }

    lastMessageCountRef.current = transcript.length
  }, [transcript, voiceEnabled, aiVoiceMuted])

  const playVoice = async (text: string) => {
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
        playPromise.catch((error) => {
          console.warn('[Voice] Autoplay blocked. User interaction required:', error.message)
          setIsSpeaking(false)
          URL.revokeObjectURL(audioUrl)

          // Show user-friendly message
          if (error.name === 'NotAllowedError') {
            console.log('[Voice] TIP: Click anywhere on the page, then send another message')
          }
        })
      }
    } catch (error) {
      console.error('[Voice] Error playing audio:', error)
      setIsSpeaking(false)
    }
  }

  const toggleVoice = () => {
    if (voiceEnabled && audioRef.current) {
      audioRef.current.pause()
      setIsSpeaking(false)
    }
    setVoiceEnabled(!voiceEnabled)
  }

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
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="flex-shrink-0 border-b border-white/10 px-4 py-3 bg-black/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Interview Chat</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleVoice}
              className={`h-8 w-8 p-0 ${voiceEnabled ? 'text-blue-400' : 'text-gray-500'}`}
              title={voiceEnabled ? 'Mute AI Voice' : 'Unmute AI Voice'}
            >
              {voiceEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {transcript.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                message.role === 'user'
                  ? 'bg-white/10 text-white'
                  : 'bg-white/5 text-gray-200'
              }`}
            >
              {message.role === 'assistant' ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/5 text-gray-400 border border-white/10 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/10 p-3 bg-black/30 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your response..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white/20 resize-none min-h-[48px] max-h-[200px]"
            disabled={isLoading}
            rows={1}
          />

          {/* Dynamic Icon: Voice when empty, Send when typing */}
          {input.trim() ? (
            <Button
              type="submit"
              disabled={isLoading}
              className="absolute right-2 bottom-2.5 h-8 w-8 p-0 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center"
              variant="ghost"
            >
              <Send className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={toggleMicrophone}
              disabled={!speechSupported}
              className={`absolute right-2 bottom-2.5 h-8 w-8 p-0 rounded-lg flex items-center justify-center ${
                isListening
                  ? 'bg-red-500/20 hover:bg-red-500/30'
                  : 'bg-white/10 hover:bg-white/20'
              } disabled:opacity-30`}
              variant="ghost"
            >
              {isListening ? (
                <Mic className="h-4 w-4 text-red-400 animate-pulse" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          )}
        </form>
      </div>
    </div>
  )
}
