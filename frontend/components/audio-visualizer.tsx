'use client'

import { useEffect, useRef } from 'react'

interface AudioVisualizerProps {
  isActive: boolean
  className?: string
}

export function AudioVisualizer({ isActive, className = '' }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isActive || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Resize canvas to fit parent
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Generate animated visualization
    let frameCount = 0
    const animate = () => {
      frameCount++
      const width = canvas.width
      const height = canvas.height

      // Clear canvas
      ctx.fillStyle = 'oklch(0.08 0 0)'
      ctx.fillRect(0, 0, width, height)

      // Draw waveform
      ctx.strokeStyle = 'oklch(0.5 0.22 262)'
      ctx.lineWidth = 2
      ctx.beginPath()

      for (let x = 0; x < width; x++) {
        const angle = (frameCount + x * 0.01) * 0.05
        const frequency1 = Math.sin(angle * 0.5) * 30
        const frequency2 = Math.cos(angle * 0.3) * 20
        const y = height / 2 + frequency1 + frequency2
        if (x === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.stroke()

      // Draw frequency bars
      ctx.fillStyle = 'oklch(0.6 0.25 10)'
      const barCount = 20
      const barWidth = width / barCount
      for (let i = 0; i < barCount; i++) {
        const height_bar = Math.sin(frameCount * 0.02 + i * 0.3) * 40 + 30
        ctx.fillRect(i * barWidth, canvas.height - height_bar, barWidth - 2, height_bar)
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
  }, [isActive])

  return (
    <canvas
      ref={canvasRef}
      className={`w-full bg-card border border-border rounded-lg ${className}`}
      style={{ height: '200px' }}
    />
  )
}
