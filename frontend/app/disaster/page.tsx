'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft } from 'lucide-react'

import { EmergencyAlert } from '@/components/emergency-alert'
import { Sidebar } from '@/components/sidebar'
import { SOSButton } from '@/components/sos-button'
import { SOSMapView } from '@/components/sos-map-view'
import { SOSSignalCard } from '@/components/sos-signal-card'
import { UltrasonicTransmitter } from '@/components/ultrasonic-transmitter'
import { Button } from '@/components/ui/button'
import { SOSReceiver } from '@/components/sos-receiver'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useSOSSignals, type LocationData } from '@/hooks/use-sos-signals'
import type { SOSSignal } from '@/lib/types'
import { cn } from '@/lib/utils'

type SeverityLevel = 'low' | 'medium' | 'high' | 'critical'

const SEVERITY_LEVELS: SeverityLevel[] = ['low', 'medium', 'high', 'critical']
const NEARBY_RADIUS_KM = 5

const severityMeta: Record<
  SeverityLevel,
  { label: string; description: string; className: string }
> = {
  low: {
    label: 'Low',
    description: 'Situational awareness, no immediate danger.',
    className: 'bg-emerald-600 text-emerald-50 hover:bg-emerald-500 focus-visible:ring-emerald-600/30',
  },
  medium: {
    label: 'Medium',
    description: 'Monitor conditions, assistance likely required.',
    className: 'bg-amber-500 text-amber-950 hover:bg-amber-400 focus-visible:ring-amber-500/30',
  },
  high: {
    label: 'High',
    description: 'Immediate threat to people or infrastructure.',
    className: 'bg-orange-500 text-orange-50 hover:bg-orange-400 focus-visible:ring-orange-500/30',
  },
  critical: {
    label: 'Critical',
    description: 'Life-threatening emergency. Broadcast widely.',
    className: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/30',
  },
}

export default function DisasterPage() {
  const {
    signals,
    currentLocation,
    broadcastSOSSignal,
    encodeSOSData,
    getSignalsNearby,
    getCurrentLocation,
  } = useSOSSignals()

  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [severity, setSeverity] = useState<SeverityLevel>('critical')
  const [lastSignalPayload, setLastSignalPayload] = useState<string | null>(null)

  useEffect(() => {
    getCurrentLocation()
  }, [getCurrentLocation])

  useEffect(() => {
    if (!isAlertOpen) return

    const timeout = setTimeout(() => setIsAlertOpen(false), 4000)
    return () => clearTimeout(timeout)
  }, [isAlertOpen])

  const nearbySignals = useMemo(
    () => getSignalsNearby(NEARBY_RADIUS_KM).length,
    [getSignalsNearby],
  )

  const recentSignals = useMemo(() => signals.slice(0, 10), [signals])

  const handleSOSActivate = async () => {
    const signal = await broadcastSOSSignal(
      message || 'Help needed - Emergency SOS signal broadcast',
      severity,
    )

    if (!signal) return

    setLastSignalPayload(`SOS:${encodeSOSData(signal)}`)
    setIsAlertOpen(true)
    setMessage('')
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <Button asChild variant="ghost" className="w-fit gap-2 px-0 text-muted-foreground">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Disaster Mode</h1>
                <p className="text-muted-foreground">
                  Coordinate rapid SOS broadcasts and situational awareness.
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-border/60 bg-card/70 px-4 py-3 text-sm text-muted-foreground">
              Last refresh updates when a new signal is recorded. Location services improve accuracy.
            </div>
          </header>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(320px,1fr)]">
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <StatCard label="Total Signals" value={signals.length} tone="destructive" />
                <StatCard
                  label={`Nearby (${NEARBY_RADIUS_KM} km)`}
                  value={nearbySignals}
                  tone="accent"
                  helper={currentLocation ? 'Based on your current GPS lock.' : 'Waiting for location.'}
                />
              </div>

              <Card className="gap-0 border-destructive/40 bg-destructive/5 py-0">
                <CardHeader className="space-y-2 border-b border-destructive/20 py-5">
                  <CardTitle>Broadcast SOS Signal</CardTitle>
                  <CardDescription>Send authenticated alerts with location metadata.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 py-6">
                  <div className="space-y-2">
                    <Label htmlFor="sos-message">Emergency Message</Label>
                    <Textarea
                      id="sos-message"
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder="Describe the emergency situation..."
                      rows={3}
                      className="min-h-[120px] resize-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Severity Level</Label>
                    <SeveritySelector value={severity} onChange={setSeverity} />
                    <p className="text-sm text-muted-foreground">{severityMeta[severity].description}</p>
                  </div>

                  {currentLocation ? (
                    <LocationPanel location={currentLocation} onRefresh={getCurrentLocation} />
                  ) : (
                    <LocationFallback onRefresh={getCurrentLocation} />
                  )}

                  <SOSButton onActivate={handleSOSActivate} disabled={!currentLocation} />
                </CardContent>
              </Card>

              <SOSMapView signals={signals} userLocation={currentLocation || undefined} />
            </div>

            <div className="space-y-6">
              <div className="space-y-6">

                    {lastSignalPayload && (
                      <UltrasonicTransmitter
                          data={lastSignalPayload}
                                />
                              )}

                    <SOSReceiver />

                        <Card>
    ...
                      </Card>

                        </div>
        

              <Card className="gap-0 py-0">
                <CardHeader className="space-y-2 border-b border-border/60 py-5">
                  <CardTitle>Active Signals</CardTitle>
                  <CardDescription>Newest 10 broadcasts across WhisperNet.</CardDescription>
                </CardHeader>
                <CardContent className="py-6">
                  {recentSignals.length === 0 ? (
                    <EmptyState
                      title="No active signals"
                      description="Once SOS broadcasts begin, they will appear here with distance estimates."
                    />
                  ) : (
                    <div className="space-y-3">
                      {recentSignals.map((signal) => (
                        <SOSSignalCard
                          key={signal.id}
                          signal={signal}
                          distance={getDistanceFromCurrent(signal, currentLocation)}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </main>

      <EmergencyAlert
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        severity={severity}
        message="SOS signal broadcast successfully"
      />
    </div>
  )
}

function SeveritySelector({
  value,
  onChange,
}: {
  value: SeverityLevel
  onChange: (value: SeverityLevel) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {SEVERITY_LEVELS.map((level) => (
        <Button
          key={level}
          type="button"
          variant={value === level ? 'default' : 'outline'}
          className={cn(
            'w-full justify-start capitalize',
            value === level ? severityMeta[level].className : 'text-muted-foreground',
          )}
          onClick={() => onChange(level)}
        >
          {severityMeta[level].label}
        </Button>
      ))}
    </div>
  )
}

function LocationPanel({
  location,
  onRefresh,
}: {
  location: LocationData
  onRefresh: () => Promise<LocationData | null>
}) {
  return (
    <div className="rounded-xl border border-primary/40 bg-primary/5 p-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 text-primary">
        <p className="font-semibold">Current Location</p>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs text-primary"
          type="button"
          onClick={onRefresh}
        >
          Refresh
        </Button>
      </div>
      <p className="font-mono text-base">
        {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
      </p>
      <p className="text-xs text-muted-foreground">Accuracy ±{location.accuracy.toFixed(0)} m</p>
    </div>
  )
}

function LocationFallback({ onRefresh }: { onRefresh: () => Promise<LocationData | null> }) {
  return (
    <div className="rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
      <p className="mb-2 font-medium text-foreground">Location unavailable</p>
      <p>Enable GPS or refresh permissions to unlock proximity filtering.</p>
      <Button variant="outline" size="sm" className="mt-3" type="button" onClick={onRefresh}>
        Retry location
      </Button>
    </div>
  )
}

function StatCard({
  label,
  value,
  tone = 'default',
  helper,
}: {
  label: string
  value: number | string
  tone?: 'default' | 'accent' | 'destructive'
  helper?: string
}) {
  const toneClass =
    tone === 'destructive'
      ? 'border-destructive/30 bg-destructive/5 text-destructive'
      : tone === 'accent'
        ? 'border-accent/30 bg-accent/5 text-accent'
        : 'border-border/60 bg-card/60 text-foreground'

  return (
    <Card className={cn('gap-0 py-0', toneClass)}>
      <CardHeader className="gap-1 px-5 py-4">
        <CardDescription className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </CardDescription>
        <CardTitle className="text-3xl font-semibold">{value}</CardTitle>
        {helper && <CardDescription>{helper}</CardDescription>}
      </CardHeader>
    </Card>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-10 text-center">
      <h4 className="text-base font-semibold text-foreground">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function getDistanceFromCurrent(signal: SOSSignal, location: LocationData | null) {
  if (!location) return undefined

  return calculateDistance(
    location.latitude,
    location.longitude,
    signal.latitude,
    signal.longitude,
  )
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
