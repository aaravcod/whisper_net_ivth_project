'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import dynamic from 'next/dynamic'

import { EmergencyAlert } from '@/components/emergency-alert'
import { Sidebar } from '@/components/sidebar'
import { SOSButton } from '@/components/sos-button'
import { SOSSignalCard } from '@/components/sos-signal-card'
import { SOSReceiver } from '@/components/sos-receiver'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useSOSSignals } from '@/hooks/use-sos-signals'
import type { SOSSignal } from '@/lib/types'

import { startSession, handshake, sendPacket } from '@/lib/api'

// 🔥 SSR FIX FOR LEAFLET (CRITICAL)
const SOSMapView = dynamic(
  () => import('@/components/sos-map-view').then(mod => mod.SOSMapView),
  { ssr: false }
)

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
  const [isListening, setIsListening] = useState(false)

  const [signalStatus, setSignalStatus] = useState('Idle')

  useEffect(() => {
    getCurrentLocation()
  }, [])

  const recentSignals = useMemo(() => signals.slice(0, 5), [signals])

  // 🚨 SEND SOS
  const handleSOSActivate = async () => {
    const signal = await broadcastSOSSignal(
      message || 'Emergency SOS',
      severity
    )

    if (!signal) return

    const payload = `SOS:${encodeSOSData(signal)}`

    try {
      // 🔐 Encoding
      setSignalStatus("🔐 Encoding emergency signal...")
      await new Promise(res => setTimeout(res, 300))

      const session = await startSession("BROADCAST", "SOS")
      await handshake(session.id)

      // 📡 Transmission
      setSignalStatus("📡 Broadcasting via MATLAB...")
      await new Promise(res => setTimeout(res, 500))

      await sendPacket(session.id, "SOS", payload)

      // 🔓 Decoding
      setSignalStatus("🔓 Decoding at receivers...")
      await new Promise(res => setTimeout(res, 300))

      setSignalStatus("🚨 SOS Delivered")

      console.log("🚨 SOS sent:", payload)

      setIsAlertOpen(true)
      setMessage('')

      setTimeout(() => setSignalStatus("Idle"), 2000)

    } catch (err) {
      console.error("❌ SOS send failed:", err)
      setSignalStatus("❌ Transmission Failed")
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-6 space-y-6">

        {/* STATUS BAR */}
        <div className="text-center text-xs text-muted-foreground animate-pulse">
          📡 Ultrasonic SOS communication active
        </div>

        <Link href="/">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        <h1 className="text-3xl font-bold">SOS Emergency System</h1>

        {/* RECEIVER CONTROL */}
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

        {/* SIGNAL PANEL */}
        <Card className="p-4 space-y-3">
          <p className="font-semibold">Signal Processing</p>

          <div className="text-sm font-medium">
            {signalStatus}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="animate-pulse">📡</span>
            <span>Ultrasonic broadcast active</span>
          </div>

          <div className="text-xs text-muted-foreground">
            Device → MATLAB → Ultrasonic → Decode → Live Map
          </div>
        </Card>

        {/* RECEIVER */}
        <SOSReceiver isListening={isListening} />

        {/* MAP (NOW FIXED) */}
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

      {/* ALERT */}
      <EmergencyAlert
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        severity="critical"
        message="SOS Sent Successfully"
      />
    </div>
  )
}