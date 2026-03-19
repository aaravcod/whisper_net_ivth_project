'use client'

import { useEffect, useMemo, useState } from 'react'
import { Zap, Square } from 'lucide-react'

import { AudioVisualizer } from '@/components/audio-visualizer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAudioEngine } from '@/hooks/use-audio-engine'
import type { EncodedPayload } from '@/lib/audio-engine'
import { startSession, handshake, sendPacket } from '@/lib/api'

interface UltrasonicTransmitterProps {
  data: string
  mode?: "TEACHER" | "STUDENT"
  onTransmitStart?: () => void
  onTransmitEnd?: () => void
}

export function UltrasonicTransmitter({
  data,
  mode,
  onTransmitStart,
  onTransmitEnd
}: UltrasonicTransmitterProps) {

  const [isTransmitting, setIsTransmitting] = useState(false)
  const [payloadPreview, setPayloadPreview] = useState<EncodedPayload | null>(null)
  const [protocolState, setProtocolState] = useState("IDLE")
  const [backendData, setBackendData] = useState<any>(null)

  // 🔥 REMOVED playAudio
  const { isInitialized, error, preparePayload } = useAudioEngine()

  useEffect(() => {
    if (!data || !isInitialized) {
      setPayloadPreview(null)
      return
    }

    const preview = preparePayload(data)
    setPayloadPreview(preview)

  }, [data, isInitialized, preparePayload])

  const checksumStatus = useMemo(() => {
    if (!payloadPreview) return null
    return `${payloadPreview.packet.checksum.toUpperCase()} • ${payloadPreview.packet.length} bytes`
  }, [payloadPreview])

  const handleTransmit = async () => {
    if (!data || !isInitialized) return

    try {
      setIsTransmitting(true)
      setProtocolState("INIT")
      onTransmitStart?.()

      const session = await startSession("BROADCAST", "ATTEND")

      setProtocolState("HANDSHAKE")
      await handshake(session.id)

      setProtocolState("ENCODING")

      const backendResult = await sendPacket(
        session.id,
        "ATTEND",
        data
      )

      setBackendData(backendResult)

      setProtocolState("TRANSMITTING")

      // 🔇 AUDIO REMOVED — MATLAB handles transmission
      console.log("🔇 Audio playback skipped")

      setProtocolState("COMPLETE")

      setTimeout(() => {
        setIsTransmitting(false)
        setProtocolState("IDLE")
        onTransmitEnd?.()
      }, 1500)

    } catch (err) {
      console.error("Transmission error:", err)
      setIsTransmitting(false)
      setProtocolState("ERROR")
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">
          Ultrasonic Transmitter
        </h3>

        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {isInitialized ? 'Engine ready' : 'Init engine'}
        </span>
      </div>

      <AudioVisualizer
        isActive={isTransmitting}
        state={protocolState}
        className="mb-6"
      />

      <div className="rounded-xl border border-border/70 bg-muted/30 p-3 text-xs mb-4">
        <p className="text-muted-foreground mb-1">Protocol Status</p>
        <p className="font-mono text-primary">{protocolState}</p>
      </div>

      <div className="space-y-4">

        {payloadPreview && (
          <div className="text-xs font-mono">
            <p className="text-muted-foreground mb-1">Signal Mapping</p>
            <p>
              {payloadPreview.binary.slice(0, 32)}...
            </p>
          </div>
        )}

        {backendData && (
          <div className="rounded-xl border border-border/70 bg-muted/20 p-3 text-xs">
            <p className="text-muted-foreground mb-1">Signal Data</p>
            <p>
              Frequencies: {backendData.frequencies?.join(", ")}
            </p>
          </div>
        )}

        <div className="rounded-xl border border-border/70 bg-card/60 p-4">
          <p className="text-sm text-muted-foreground mb-2">Payload</p>
          <p className="font-mono text-primary break-all text-sm">
            {data || 'No data'}
          </p>

          {checksumStatus && (
            <p className="mt-2 text-xs text-muted-foreground">
              Checksum • {checksumStatus}
            </p>
          )}
        </div>

        {payloadPreview && (
          <div className="grid gap-3 rounded-xl border border-border/70 bg-muted/20 p-3 text-xs">

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Version</span>
              <span className="font-mono text-foreground">
                v{payloadPreview.packet.version}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Binary length</span>
              <span className="font-mono text-foreground">
                {payloadPreview.binary.length} bits
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Timestamp</span>
              <span className="font-mono text-foreground">
                {new Date(payloadPreview.packet.timestamp).toLocaleTimeString()}
              </span>
            </div>

          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button
          onClick={handleTransmit}
          disabled={!isInitialized || !data || isTransmitting}
          className="w-full"
          size="lg"
        >
          {isTransmitting ? (
            <>
              <Square className="w-5 h-5 mr-2 animate-pulse" />
              Transmitting...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 mr-2" />
              Broadcast Data
            </>
          )}
        </Button>

      </div>
    </Card>
  )
}