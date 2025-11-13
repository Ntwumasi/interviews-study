'use client'

import { useEffect, useRef, useState } from 'react'
import { Video, VideoOff, Mic, MicOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function UserCamera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [isMicOn, setIsMicOn] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: true,
      })

      setStream(mediaStream)
      setIsCameraOn(true)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      setError('Camera access denied or unavailable')
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

  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMicOn(audioTrack.enabled)
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
    <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden border border-white/10">
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
          <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
            <Video className="w-10 h-10 text-blue-400" />
          </div>
          <p className="text-gray-400 text-sm mb-4">Camera Off</p>
          {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
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
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
          <button
            onClick={toggleMic}
            className={`p-2 rounded-full ${
              isMicOn ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500 hover:bg-red-600'
            } transition-colors`}
          >
            {isMicOn ? (
              <Mic className="w-4 h-4 text-white" />
            ) : (
              <MicOff className="w-4 h-4 text-white" />
            )}
          </button>
          <button
            onClick={stopCamera}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <VideoOff className="w-4 h-4 text-white" />
          </button>
        </div>
      )}

      {/* Label */}
      <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-xs text-white">
        You
      </div>
    </div>
  )
}
