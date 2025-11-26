'use client'

import { useEffect, useRef, useState } from 'react'
import { Video, VideoOff } from 'lucide-react'

export function UserCamera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Attach stream to video element when stream changes
  useEffect(() => {
    if (stream && videoRef.current) {
      console.log('[Camera] Attaching stream to video element')
      videoRef.current.srcObject = stream

      // Force play after a small delay to ensure the video element is ready
      const playVideo = async () => {
        try {
          if (videoRef.current) {
            await videoRef.current.play()
            console.log('[Camera] Video playing successfully')
          }
        } catch (err) {
          console.error('[Camera] Error playing video:', err)
          setError('Unable to display camera feed. Please try again.')
        }
      }

      playVideo()
    }
  }, [stream])

  const startCamera = async () => {
    try {
      setError(null)
      console.log('[Camera] Starting camera...')

      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera not supported in this browser')
        return
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false, // Don't request audio to avoid conflicts
      })

      console.log('[Camera] Camera stream obtained:', mediaStream.getVideoTracks().length, 'video tracks')

      setIsCameraOn(true)
      setStream(mediaStream)
    } catch (err: any) {
      console.error('[Camera] Error accessing camera:', err)

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera access denied. Please allow camera permissions.')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera found on this device.')
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('Camera is in use by another application.')
      } else {
        setError('Unable to access camera. Please try again.')
      }
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
      setIsCameraOn(false)
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  return (
    <div className="relative w-full h-full bg-[#1a1a1a]">
      {/* Video element - always rendered */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover ${isCameraOn ? 'block' : 'hidden'}`}
      />

      {/* Camera off state - minimal */}
      {!isCameraOn && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <button
            onClick={startCamera}
            className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-white/5 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-white/[0.08] flex items-center justify-center group-hover:bg-white/[0.12] transition-colors">
              <Video className="w-5 h-5 text-gray-400" />
            </div>
            <span className="text-[12px] text-gray-500 group-hover:text-gray-400">Turn on camera</span>
          </button>
          {error && (
            <p className="text-red-400/80 text-[11px] mt-2 text-center px-4 max-w-[200px]">{error}</p>
          )}
        </div>
      )}

      {/* Camera on - minimal controls */}
      {isCameraOn && (
        <>
          {/* Turn off button - bottom center */}
          <button
            onClick={stopCamera}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 p-2 rounded-full bg-black/60 hover:bg-red-600 transition-colors"
            title="Turn off camera"
          >
            <VideoOff className="w-3.5 h-3.5 text-white" />
          </button>
        </>
      )}
    </div>
  )
}
