'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Circle, Square, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

interface InterviewRecorderProps {
  interviewId: string
  onRecordingComplete?: (uploadId: string) => void
  autoStart?: boolean
}

type RecordingState = 'idle' | 'recording' | 'stopped' | 'uploading' | 'complete' | 'error'

export function InterviewRecorder({
  interviewId,
  onRecordingComplete,
  autoStart = false
}: InterviewRecorderProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Auto-start recording if enabled
  useEffect(() => {
    if (autoStart && recordingState === 'idle') {
      startRecording()
    }
  }, [autoStart])

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      chunksRef.current = []

      // Request camera and microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      })

      streamRef.current = stream

      // Create MediaRecorder with appropriate MIME type
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : 'video/mp4'

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 2500000, // 2.5 Mbps for good quality
      })

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(1000) // Collect data every second

      // Start duration timer
      startTimeRef.current = Date.now()
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }, 1000)

      setRecordingState('recording')
      console.log('[Recorder] Recording started')
    } catch (err: any) {
      console.error('[Recorder] Failed to start recording:', err)
      setError(err.message || 'Failed to access camera/microphone')
      setRecordingState('error')
    }
  }, [])

  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || recordingState !== 'recording') {
      return
    }

    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    // Stop recording
    mediaRecorderRef.current.stop()
    setRecordingState('stopped')

    // Wait a moment for final chunks
    await new Promise(resolve => setTimeout(resolve, 500))

    // Create blob from chunks
    const blob = new Blob(chunksRef.current, {
      type: mediaRecorderRef.current.mimeType
    })

    console.log(`[Recorder] Recording stopped. Size: ${(blob.size / 1024 / 1024).toFixed(2)} MB`)

    // Upload to Mux
    await uploadToMux(blob)
  }, [recordingState, interviewId])

  const uploadToMux = async (blob: Blob) => {
    try {
      setRecordingState('uploading')
      setUploadProgress(0)

      // Get direct upload URL from our API
      const response = await fetch('/api/mux/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interviewId }),
      })

      if (!response.ok) {
        throw new Error('Failed to get upload URL')
      }

      const { uploadUrl, uploadId } = await response.json()

      // Upload directly to Mux using PUT
      const uploadResponse = await new Promise<Response>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100)
            setUploadProgress(progress)
          }
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(new Response(null, { status: xhr.status }))
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        }

        xhr.onerror = () => reject(new Error('Network error during upload'))

        xhr.open('PUT', uploadUrl)
        xhr.send(blob)
      })

      console.log('[Recorder] Upload complete')
      setRecordingState('complete')

      if (onRecordingComplete) {
        onRecordingComplete(uploadId)
      }
    } catch (err: any) {
      console.error('[Recorder] Upload failed:', err)
      setError(err.message || 'Failed to upload recording')
      setRecordingState('error')
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Minimal pill-style recorder UI
  return (
    <div className="flex items-center">
      {recordingState === 'idle' && (
        <button
          onClick={startRecording}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80 transition-colors"
        >
          <Circle className="w-2 h-2 text-red-500 fill-current" />
          <span className="text-[11px] text-white font-medium">Record</span>
        </button>
      )}

      {recordingState === 'recording' && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/90 backdrop-blur-sm">
            <Circle className="w-2 h-2 text-white fill-current animate-pulse" />
            <span className="text-[11px] text-white font-mono font-medium">{formatDuration(duration)}</span>
          </div>
          <button
            onClick={stopRecording}
            className="flex items-center justify-center w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80 transition-colors"
            title="Stop recording"
          >
            <Square className="w-2.5 h-2.5 text-white fill-current" />
          </button>
        </div>
      )}

      {recordingState === 'stopped' && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm">
          <Loader2 className="w-3 h-3 text-white animate-spin" />
          <span className="text-[11px] text-white">Processing...</span>
        </div>
      )}

      {recordingState === 'uploading' && (
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm">
          <div className="w-12 h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <span className="text-[11px] text-white">{uploadProgress}%</span>
        </div>
      )}

      {recordingState === 'complete' && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/20 backdrop-blur-sm">
          <CheckCircle2 className="w-3 h-3 text-green-400" />
          <span className="text-[11px] text-green-400">Saved</span>
        </div>
      )}

      {recordingState === 'error' && (
        <button
          onClick={startRecording}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 backdrop-blur-sm hover:bg-red-500/30 transition-colors"
        >
          <AlertCircle className="w-3 h-3 text-red-400" />
          <span className="text-[11px] text-red-400">Retry</span>
        </button>
      )}
    </div>
  )
}
