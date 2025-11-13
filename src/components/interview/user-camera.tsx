'use client'

import { useEffect, useRef, useState } from 'react'
import { Video, VideoOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function UserCamera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startCamera = async () => {
    try {
      setError(null)

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

      setStream(mediaStream)
      setIsCameraOn(true)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        // Ensure video starts playing
        videoRef.current.play().catch((err) => {
          console.error('Error playing video:', err)
        })
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err)

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
    <div className="relative w-full h-full bg-gray-900">
      {isCameraOn ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-3">
            <Video className="w-8 h-8 text-blue-400" />
          </div>
          <p className="text-gray-400 text-sm mb-2">Camera Off</p>
          {error && <p className="text-red-400 text-xs mb-3 text-center px-4 max-w-xs">{error}</p>}
          <Button
            size="sm"
            onClick={startCamera}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Turn On Camera
          </Button>
        </div>
      )}

      {/* Controls */}
      {isCameraOn && (
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
          <button
            onClick={stopCamera}
            className="p-2.5 rounded-full bg-red-600 hover:bg-red-700 transition-colors shadow-lg"
            title="Turn off camera"
          >
            <VideoOff className="w-4 h-4 text-white" />
          </button>
        </div>
      )}

      {/* Label */}
      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1 rounded text-xs text-white font-medium">
        You
      </div>
    </div>
  )
}
