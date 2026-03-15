'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmergencyAlertProps {
  isOpen: boolean
  onClose: () => void
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
}

export function EmergencyAlert({
  isOpen,
  onClose,
  severity,
  message,
}: EmergencyAlertProps) {
  const [isPulsing, setIsPulsing] = useState(true)

  useEffect(() => {
    if (!isOpen) return

    // Audio alert for critical severity
    if (severity === 'critical') {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    }

    const timer = setInterval(() => setIsPulsing(prev => !prev), 500)
    return () => clearInterval(timer)
  }, [isOpen, severity])

  if (!isOpen) return null

  const getSeverityColor = () => {
    switch (severity) {
      case 'critical':
        return 'bg-destructive/90 border-destructive'
      case 'high':
        return 'bg-accent/90 border-accent'
      case 'medium':
        return 'bg-yellow-600/90 border-yellow-600'
      default:
        return 'bg-primary/90 border-primary'
    }
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80`}>
      <div
        className={`max-w-md w-full p-6 rounded-lg border-2 ${getSeverityColor()} text-white shadow-2xl ${
          isPulsing ? 'animate-pulse' : ''
        }`}
      >
        <div className="flex items-start gap-4 mb-4">
          <AlertTriangle className={`w-8 h-8 flex-shrink-0 ${isPulsing ? 'animate-bounce' : ''}`} />
          <h2 className="text-2xl font-bold uppercase">{severity} Alert</h2>
        </div>

        <p className="mb-6 text-lg">{message}</p>

        <Button
          onClick={onClose}
          className="w-full gap-2 bg-white/20 hover:bg-white/30 text-white border border-white/50"
        >
          <X className="w-4 h-4" />
          Dismiss
        </Button>
      </div>
    </div>
  )
}
