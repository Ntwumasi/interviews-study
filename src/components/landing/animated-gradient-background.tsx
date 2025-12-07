'use client'

import { useEffect, useRef, useCallback } from 'react'

export function AnimatedGradientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const timeRef = useRef(0)

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    timeRef.current += 1
    const time = timeRef.current
    const width = canvas.width / (window.devicePixelRatio || 1)
    const height = canvas.height / (window.devicePixelRatio || 1)

    // Clear with pure black
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, width, height)

    // Gradient orbs - tighter, more focused
    const orbs = [
      { x: 0.15, y: 0.25, radius: 0.45, color: [16, 185, 129], speed: 0.00015, phase: 0 },    // emerald
      { x: 0.85, y: 0.35, radius: 0.4, color: [59, 130, 246], speed: 0.0002, phase: 2 },      // blue
      { x: 0.5, y: 0.65, radius: 0.5, color: [139, 92, 246], speed: 0.00012, phase: 4 },      // violet
    ]

    // Draw gradient orbs
    orbs.forEach((orb) => {
      const offsetX = Math.sin(time * orb.speed + orb.phase) * 0.08
      const offsetY = Math.cos(time * orb.speed * 0.7 + orb.phase) * 0.06

      const x = (orb.x + offsetX) * width
      const y = (orb.y + offsetY) * height
      const radius = orb.radius * Math.min(width, height)

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
      gradient.addColorStop(0, `rgba(${orb.color[0]}, ${orb.color[1]}, ${orb.color[2]}, 0.25)`)
      gradient.addColorStop(0.5, `rgba(${orb.color[0]}, ${orb.color[1]}, ${orb.color[2]}, 0.08)`)
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

      ctx.globalCompositeOperation = 'lighter'
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
    })

    ctx.globalCompositeOperation = 'source-over'
    animationRef.current = requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

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
    animationRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationRef.current)
    }
  }, [animate])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        aria-hidden="true"
      />
      {/* Grid */}
      <div
        className="fixed inset-0 pointer-events-none z-[1] opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
        aria-hidden="true"
      />
      {/* Noise */}
      <div
        className="fixed inset-0 pointer-events-none z-[2] opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />
      {/* Vignette */}
      <div
        className="fixed inset-0 pointer-events-none z-[3]"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 0%, transparent 0%, rgba(0,0,0,0.6) 100%)',
        }}
        aria-hidden="true"
      />
    </>
  )
}
