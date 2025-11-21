'use client'

import { useEffect, useState } from 'react'

interface TypingTextProps {
  text: string
  className?: string
  delay?: number
  speed?: number
}

export function TypingText({ text, className = '', delay = 500, speed = 100 }: TypingTextProps) {
  const [mounted, setMounted] = useState(false)
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(false)

  // Handle mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Start typing after component mounts and initial delay
  useEffect(() => {
    if (!mounted) return

    const startDelay = setTimeout(() => {
      setIsTyping(true)
    }, delay)

    return () => clearTimeout(startDelay)
  }, [mounted, delay])

  // Type each character
  useEffect(() => {
    if (!isTyping || !mounted) return

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, speed)

      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text, speed, isTyping, mounted])

  // Show full text on server and before animation starts
  if (!mounted || !isTyping) {
    return <span className={className}>{displayedText || '\u00A0'}</span>
  }

  return (
    <span className={className}>
      {displayedText || '\u00A0'}
      {currentIndex < text.length && (
        <span className="animate-pulse ml-0.5">|</span>
      )}
    </span>
  )
}
