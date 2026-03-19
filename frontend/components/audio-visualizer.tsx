'use client'

import { useEffect, useRef } from 'react'

interface AudioVisualizerProps {
  isActive: boolean
  state?: string
  className?: string

}

export function AudioVisualizer({ isActive, state,className = '' }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
  if (!isActive || !canvasRef.current) return

  const canvas = canvasRef.current
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const resizeCanvas = () => {
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
  }
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)

  let frameCount = 0

  const getSpeedMultiplier = () => {
    switch (state) {
      case "INIT": return 0.5
      case "HANDSHAKE": return 1
      case "ENCODING": return 1.5
      case "TRANSMITTING": return 3
      case "COMPLETE": return 0.2
      case "ERROR": return 2
      default: return 1
    }
  }

  const getColor = () => {
    switch (state) {
      case "TRANSMITTING": return 'oklch(0.7 0.3 260)'
      case "COMPLETE": return 'oklch(0.7 0.25 140)' // green
      case "ERROR": return 'oklch(0.7 0.3 20)' // red
      default: return 'oklch(0.5 0.22 262)'
    }
  }

  const animate = () => {
    frameCount++
    const width = canvas.width
    const height = canvas.height
    const speed = getSpeedMultiplier()

    // Background
    ctx.fillStyle = 'oklch(0.08 0 0)'
    ctx.fillRect(0, 0, width, height)

    // Waveform
    ctx.strokeStyle = getColor()
    ctx.lineWidth = state === "TRANSMITTING" ? 3 : 2
    ctx.beginPath()

    for (let x = 0; x < width; x++) {
      const angle = (frameCount + x * 0.01) * 0.05 * speed
      const y =
        height / 2 +
        Math.sin(angle * 0.5) * 30 +
        Math.cos(angle * 0.3) * 20

      if (x === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()

    // Frequency bars
    const barCount = 20
    const barWidth = width / barCount

    for (let i = 0; i < barCount; i++) {
      let base = Math.sin(frameCount * 0.02 * speed + i * 0.3)

      // Special effects per state
      if (state === "HANDSHAKE") {
        base = Math.sin(frameCount * 0.3 + i) // blinking effect
      }

      if (state === "COMPLETE") {
        base = 0.3 // calm
      }

      if (state === "ERROR") {
        base = Math.random() // chaotic
      }

      const height_bar = base * 40 + 30

      ctx.fillStyle = getColor()
      ctx.fillRect(i * barWidth, height - height_bar, barWidth - 2, height_bar)
    }

    // Glow effect for transmitting
    if (state === "TRANSMITTING") {
      ctx.shadowBlur = 20
      ctx.shadowColor = getColor()
    } else {
      ctx.shadowBlur = 0
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  animate()

  return () => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current)
    }
    window.removeEventListener('resize', resizeCanvas)
  }
}, [isActive, state])

  return (
    <canvas
      ref={canvasRef}
      className={`w-full bg-card border border-border rounded-lg ${className}`}
      style={{ height: '200px' }}
    />
  )
}
