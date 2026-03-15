'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface SOSButtonProps {
  onActivate: () => void
  disabled?: boolean
}

export function SOSButton({ onActivate, disabled = false }: SOSButtonProps) {
  const [isActive, setIsActive] = useState(false)
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    if (!isActive) return

    if (countdown === 0) {
      onActivate()
      setIsActive(false)
      setCountdown(3)
      return
    }

    const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [isActive, countdown, onActivate])

  if (isActive) {
    return (
      <Button
        disabled
        className="w-full h-24 text-xl font-bold bg-destructive/20 border-2 border-destructive text-destructive hover:bg-destructive/20"
      >
        <div className="flex flex-col items-center gap-2">
          <AlertTriangle className="w-8 h-8 animate-pulse" />
          <span className="text-4xl font-bold">{countdown}</span>
        </div>
      </Button>
    )
  }

  return (
    <Button
      onClick={() => setIsActive(true)}
      disabled={disabled}
      className="w-full h-24 text-2xl font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90"
    >
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-8 h-8" />
        BROADCAST SOS
      </div>
    </Button>
  )
}
