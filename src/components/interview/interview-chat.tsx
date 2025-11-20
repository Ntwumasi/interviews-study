'use client'

import { useEffect, useRef, useState } from 'react'
import { TranscriptMessage } from '@/types'
import { Button } from '@/components/ui/button'
import { Send, Volume2, VolumeX, Mic, MicOff } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface InterviewChatProps {
  transcript: TranscriptMessage[]
  onSendMessage: (message: string) => void
}

export function InterviewChat({ transcript, onSendMessage }: InterviewChatProps) {
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
      {/* Voice Control Header */}
      <div className="flex items-center justify-end gap-2 px-4 py-2 border-b border-white/10 bg-white/5">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleVoice}
          className={`text-xs ${voiceEnabled ? 'text-blue-400' : 'text-gray-500'}`}
          title={voiceEnabled ? 'Mute AI Voice' : 'Unmute AI Voice'}
        >
          {voiceEnabled ? (
            <>
              <Volume2 className="h-4 w-4 mr-1" />
              {isSpeaking && <span className="animate-pulse">Speaking...</span>}
              {!isSpeaking && <span>Voice On</span>}
            </>
          ) : (
            <>
              <VolumeX className="h-4 w-4 mr-1" />
              <span>Voice Off</span>
            </>
          )}
        </Button>

        {speechSupported && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMicrophone}
            className={`text-xs ${isListening ? 'text-red-400 animate-pulse' : 'text-gray-500'}`}
            title={isListening ? 'Stop Recording' : 'Start Voice Input'}
          >
            {isListening ? (
              <>
                <Mic className="h-4 w-4 mr-1" />
                <span>Listening...</span>
              </>
            ) : (
              <>
                <MicOff className="h-4 w-4 mr-1" />
                <span>Microphone</span>
              </>
            )}
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {transcript.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/5 text-gray-200 border border-white/10'
              }`}
            >
              {message.role === 'assistant' ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{message.content}</p>
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
      <div className="border-t border-white/10 p-4 bg-[#0A0A0A]/50 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={speechSupported ? "Type or click microphone to speak... (Shift+Enter for new line)" : "Type your response... (Shift+Enter for new line)"}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[60px] max-h-[200px]"
            disabled={isLoading}
            rows={1}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="self-end h-[60px] px-6"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send • Shift+Enter for new line • <span className="text-blue-400">💡 AI can see your code</span>
        </p>
      </div>
    </div>
  )
}
