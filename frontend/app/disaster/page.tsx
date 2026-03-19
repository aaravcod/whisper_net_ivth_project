'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft } from 'lucide-react'

import { EmergencyAlert } from '@/components/emergency-alert'
import { Sidebar } from '@/components/sidebar'
import { SOSButton } from '@/components/sos-button'
import { SOSMapView } from '@/components/sos-map-view'
import { SOSSignalCard } from '@/components/sos-signal-card'
import { SOSReceiver } from '@/components/sos-receiver'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useSOSSignals } from '@/hooks/use-sos-signals'
import type { SOSSignal } from '@/lib/types'

import { startSession, handshake, sendPacket } from '@/lib/api'

type SeverityLevel = 'low' | 'medium' | 'high' | 'critical'

export default function DisasterPage() {
  const {
    signals,
    currentLocation,
    broadcastSOSSignal,
    encodeSOSData,
    getCurrentLocation,
  } = useSOSSignals()

  const [message, setMessage] = useState('')
  const [severity] = useState<SeverityLevel>('critical')
  const [isAlertOpen, setIsAlertOpen] = useState(false)

  // 🔥 LISTEN CONTROL
  const [isListening, setIsListening] = useState(false)

  useEffect(() => {
    getCurrentLocation()
  }, [])

  const recentSignals = useMemo(() => signals.slice(0, 5), [signals])

  // 🔥 SEND SOS → BACKEND
  const handleSOSActivate = async () => {
    const signal = await broadcastSOSSignal(
      message || 'Emergency SOS',
      severity
    )

    if (!signal) return

    const payload = `SOS:${encodeSOSData(signal)}`

    try {
      const session = await startSession("BROADCAST", "SOS")
      await handshake(session.id)

      await sendPacket(
        session.id,
        "SOS",
        payload
      )

      console.log("🚨 SOS sent:", payload)

      setIsAlertOpen(true)
      setMessage('')

    } catch (err) {
      console.error("❌ SOS send failed:", err)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-6 space-y-6">

        <div className="text-center text-xs text-muted-foreground">
          📡 Ultrasonic SOS communication active
        </div>

        <Link href="/">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        <h1 className="text-3xl font-bold">SOS Emergency System</h1>

        {/* 🔥 RECEIVER CONTROL BUTTON */}
        <Card className="p-4 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Receiver Control
          </p>

          <Button onClick={() => setIsListening(prev => !prev)}>
            {isListening ? "Stop Listening" : "Start Listening"}
          </Button>
        </Card>

        {/* INPUT */}
        <Card>
          <CardHeader>
            <CardTitle>Send SOS</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter emergency message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <SOSButton onActivate={handleSOSActivate} />
          </CardContent>
        </Card>

        {/* 🔥 RECEIVER */}
        <SOSReceiver isListening={isListening} />

        {/* MAP */}
        <SOSMapView
          signals={signals}
          userLocation={currentLocation || undefined}
        />

        {/* SIGNAL LIST */}
        <Card>
          <CardHeader>
            <CardTitle>Received Signals</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {recentSignals.map(signal => (
              <SOSSignalCard key={signal.id} signal={signal} />
            ))}
          </CardContent>
        </Card>

      </main>

      <EmergencyAlert
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        severity="critical"
        message="SOS Sent Successfully"
      />
    </div>
  )
}