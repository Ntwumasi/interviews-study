'use client'

import { useEffect, useRef } from 'react'

export function AnimatedGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let time = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    window.addEventListener('resize', resize)

    const animate = () => {
      time += 0.005
      const width = window.innerWidth
      const height = window.innerHeight

      // Clear
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, width, height)

      // Grid settings
      const gridSize = 60
      const perspectiveOriginY = height * 0.3 // Horizon line
      const maxFade = height * 0.8

      // Draw horizontal lines with perspective
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'
      ctx.lineWidth = 1

      for (let y = perspectiveOriginY; y < height + gridSize; y += gridSize) {
        const progress = (y - perspectiveOriginY) / (height - perspectiveOriginY)
        const opacity = 0.02 + progress * 0.04

        // Subtle wave animation
        const wave = Math.sin(time * 2 + progress * 3) * 0.5 + 0.5
        const finalOpacity = opacity * (0.7 + wave * 0.3)

        ctx.strokeStyle = `rgba(255, 255, 255, ${finalOpacity})`
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Draw vertical lines - straight, no perspective needed for this look
      for (let x = 0; x < width + gridSize; x += gridSize) {
        const normalizedX = x / width
        const distFromCenter = Math.abs(normalizedX - 0.5) * 2
        const opacity = 0.03 * (1 - distFromCenter * 0.5)

        // Subtle shimmer
        const shimmer = Math.sin(time * 1.5 + x * 0.01) * 0.3 + 0.7

        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * shimmer})`
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }

      // Animated glow spots that travel along grid intersections
      const glowPoints = [
        { x: 0.2, y: 0.4, speed: 0.3, size: 150, color: [16, 185, 129] },  // emerald
        { x: 0.8, y: 0.3, speed: 0.25, size: 120, color: [59, 130, 246] }, // blue
        { x: 0.5, y: 0.6, speed: 0.35, size: 180, color: [139, 92, 246] }, // violet
      ]

      glowPoints.forEach((point, i) => {
        // Animate position along a path
        const offsetX = Math.sin(time * point.speed + i * 2) * 0.15
        const offsetY = Math.cos(time * point.speed * 0.7 + i) * 0.1

        const x = (point.x + offsetX) * width
        const y = (point.y + offsetY) * height

        // Pulsing size
        const pulse = Math.sin(time * 2 + i) * 0.2 + 1
        const size = point.size * pulse

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size)
        gradient.addColorStop(0, `rgba(${point.color[0]}, ${point.color[1]}, ${point.color[2]}, 0.15)`)
        gradient.addColorStop(0.5, `rgba(${point.color[0]}, ${point.color[1]}, ${point.color[2]}, 0.05)`)
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)
      })

      // Scanning line effect - subtle horizontal line that moves down
      const scanY = ((time * 50) % (height + 200)) - 100
      const scanGradient = ctx.createLinearGradient(0, scanY - 50, 0, scanY + 50)
      scanGradient.addColorStop(0, 'rgba(16, 185, 129, 0)')
      scanGradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.03)')
      scanGradient.addColorStop(1, 'rgba(16, 185, 129, 0)')

      ctx.fillStyle = scanGradient
      ctx.fillRect(0, scanY - 50, width, 100)

      // Intersection highlights - random grid points that glow
      const intersectionCount = 5
      for (let i = 0; i < intersectionCount; i++) {
        const seed = i * 1234.5678
        const ix = Math.floor((Math.sin(seed) * 0.5 + 0.5) * (width / gridSize)) * gridSize
        const iy = Math.floor((Math.cos(seed) * 0.5 + 0.5) * (height / gridSize)) * gridSize

        // Fade in and out
        const fade = Math.sin(time * 0.5 + i * 1.5) * 0.5 + 0.5

        if (fade > 0.3) {
          const glowSize = 30 * fade
          const intGradient = ctx.createRadialGradient(ix, iy, 0, ix, iy, glowSize)
          intGradient.addColorStop(0, `rgba(255, 255, 255, ${0.1 * fade})`)
          intGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

          ctx.fillStyle = intGradient
          ctx.fillRect(ix - glowSize, iy - glowSize, glowSize * 2, glowSize * 2)
        }
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    />
  )
}
