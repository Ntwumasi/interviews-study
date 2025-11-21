'use client'

import { useEffect, useState } from 'react'

interface CyclingTypingTextProps {
  words: string[]
  className?: string
  typingSpeed?: number
  deletingSpeed?: number
  pauseAfterTyping?: number
  pauseAfterDeleting?: number
}

export function CyclingTypingText({
  words,
  className = '',
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseAfterTyping = 2000,
  pauseAfterDeleting = 500,
}: CyclingTypingTextProps) {
  const [mounted, setMounted] = useState(false)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const currentWord = words[currentWordIndex]

    // Handle pauses
    if (isPaused) {
      const pauseDuration = isDeleting ? pauseAfterDeleting : pauseAfterTyping
      const pauseTimeout = setTimeout(() => {
        setIsPaused(false)
      }, pauseDuration)
      return () => clearTimeout(pauseTimeout)
    }

    // Typing phase
    if (!isDeleting && currentText !== currentWord) {
      const timeout = setTimeout(() => {
        setCurrentText(currentWord.slice(0, currentText.length + 1))
      }, typingSpeed)
      return () => clearTimeout(timeout)
    }

    // Pause after typing complete
    if (!isDeleting && currentText === currentWord) {
      setIsPaused(true)
      setIsDeleting(true)
      return
    }

    // Deleting phase
    if (isDeleting && currentText !== '') {
      const timeout = setTimeout(() => {
        setCurrentText(currentText.slice(0, -1))
      }, deletingSpeed)
      return () => clearTimeout(timeout)
    }

    // Pause after deleting complete, then move to next word
    if (isDeleting && currentText === '') {
      setIsPaused(true)
      setIsDeleting(false)
      setCurrentWordIndex((prev) => (prev + 1) % words.length)
      return
    }
  }, [
    mounted,
    currentText,
    currentWordIndex,
    isDeleting,
    isPaused,
    words,
    typingSpeed,
    deletingSpeed,
    pauseAfterTyping,
    pauseAfterDeleting,
  ])

  if (!mounted) {
    return <span className={className}>{words[0]}</span>
  }

  return (
    <span className={className}>
      {currentText}
      <span className="animate-pulse ml-0.5">|</span>
    </span>
  )
}
