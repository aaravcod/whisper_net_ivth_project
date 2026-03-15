'use client'

import { SOSSignal } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { AlertTriangle, MapPin, Clock } from 'lucide-react'

interface SOSSignalCardProps {
  signal: SOSSignal
  distance?: number
}

export function SOSSignalCard({ signal, distance }: SOSSignalCardProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-destructive bg-destructive/10 border-destructive/30'
      case 'high':
        return 'text-accent bg-accent/10 border-accent/30'
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30'
      default:
        return 'text-primary bg-primary/10 border-primary/30'
    }
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const openMap = () => {
    const url = `https://maps.google.com/?q=${signal.latitude},${signal.longitude}`
    window.open(url, '_blank')
  }

  return (
    <Card className={`p-4 border-2 ${getSeverityColor(signal.severity)}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-bold text-foreground uppercase text-sm">{signal.severity} Severity</p>
            <p className="text-xs text-muted-foreground">ID: {signal.senderId}</p>
          </div>
        </div>
      </div>

      <p className="text-foreground mb-3">{signal.message}</p>

      <div className="space-y-2 mb-3 text-sm">
        <button
          onClick={openMap}
          className="flex items-center gap-2 text-primary hover:underline w-full text-left"
        >
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="font-mono text-xs">
            {signal.latitude.toFixed(4)}, {signal.longitude.toFixed(4)}
          </span>
          {distance && <span className="text-xs text-muted-foreground ml-auto">{distance.toFixed(1)} km</span>}
        </button>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span className="text-xs">{formatTime(signal.timestamp)}</span>
        </div>
      </div>
    </Card>
  )
}
