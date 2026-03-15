'use client'

import { memo, useMemo } from 'react'

import type { ListeningFrame } from '@/lib/audio-engine'
import { cn } from '@/lib/utils'

interface AudioSpectrumProps {
  frame: ListeningFrame | null
  className?: string
  bars?: number
}

export const AudioSpectrum = memo(function AudioSpectrum({
  frame,
  className,
  bars = 28,
}: AudioSpectrumProps) {
  const samples = useMemo(() => {
    if (!frame?.fft?.length) {
      return Array.from({ length: bars }, () => 0)
    }

    const chunkSize = Math.floor(frame.fft.length / bars)
    return Array.from({ length: bars }, (_, index) => {
      const start = index * chunkSize
      const slice = frame.fft.slice(start, start + chunkSize)
      const avg = slice.reduce((sum, value) => sum + value, 0) / (slice.length || 1)
      return Math.min(avg / 255, 1)
    })
  }, [frame, bars])

  return (
    <div
      className={cn(
        'rounded-xl border border-border/60 bg-gradient-to-b from-background/60 to-card/60 p-3',
        className,
      )}
    >
      <div className="flex items-end gap-1">
        {samples.map((value, index) => (
          <span
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className="flex-1 rounded-full bg-primary/30"
            style={{
              height: `${Math.max(8, value * 100)}px`,
              transition: 'height 120ms ease-out',
            }}
          />
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <p>{frame ? `${Math.round(frame.dominantFrequency)} Hz peak` : 'Waiting for signal'}</p>
        <p>{frame ? `${Math.round(frame.confidence * 100)}% confidence` : ''}</p>
      </div>
    </div>
  )
})

