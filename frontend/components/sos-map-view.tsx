'use client'

import { SOSSignal } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { MapPin, AlertTriangle } from 'lucide-react'

interface SOSMapViewProps {
  signals: SOSSignal[]
  userLocation?: { latitude: number; longitude: number }
}

export function SOSMapView({ signals, userLocation }: SOSMapViewProps) {
  // Calculate bounds
  const allLocations = userLocation ? [userLocation, ...signals] : signals

  if (allLocations.length === 0) {
    return (
      <Card className="p-8 text-center">
        <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">No signals to display</p>
      </Card>
    )
  }

  const lats = allLocations.map(l => l.latitude)
  const lons = allLocations.map(l => l.longitude)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLon = Math.min(...lons)
  const maxLon = Math.max(...lons)

  const padding = 0.01
  const height = 400
  const width = 600

  const latRange = maxLat - minLat || 0.01
  const lonRange = maxLon - minLon || 0.01

  const getX = (lon: number) => ((lon - minLon + padding) / (lonRange + padding * 2)) * width
  const getY = (lat: number) => ((maxLat + padding - lat) / (latRange + padding * 2)) * height

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-foreground mb-4">SOS Signal Map</h3>

      <div className="bg-card/50 border border-border rounded-lg overflow-hidden">
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="oklch(0.2 0 0)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width={width} height={height} fill="url(#grid)" />

          {/* User location */}
          {userLocation && (
            <g>
              <circle
                cx={getX(userLocation.longitude)}
                cy={getY(userLocation.latitude)}
                r="8"
                fill="oklch(0.5 0.22 262)"
                opacity="0.8"
              />
              <circle
                cx={getX(userLocation.longitude)}
                cy={getY(userLocation.latitude)}
                r="15"
                fill="none"
                stroke="oklch(0.5 0.22 262)"
                strokeWidth="1"
                opacity="0.4"
              />
            </g>
          )}

          {/* SOS Signals */}
          {signals.map((signal, idx) => {
            const color =
              signal.severity === 'critical'
                ? 'oklch(0.577 0.245 27.325)'
                : signal.severity === 'high'
                  ? 'oklch(0.6 0.25 10)'
                  : 'oklch(0.5 0.22 262)'

            return (
              <g key={signal.id}>
                <circle
                  cx={getX(signal.longitude)}
                  cy={getY(signal.latitude)}
                  r="6"
                  fill={color}
                />
                <circle
                  cx={getX(signal.longitude)}
                  cy={getY(signal.latitude)}
                  r="12"
                  fill="none"
                  stroke={color}
                  strokeWidth="1"
                  opacity="0.5"
                />
              </g>
            )
          })}
        </svg>
      </div>

      <div className="mt-4 flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary"></div>
          <span className="text-muted-foreground">Your Location</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3 h-3 text-destructive" />
          <span className="text-muted-foreground">SOS Signals</span>
        </div>
      </div>
    </Card>
  )
}
