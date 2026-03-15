'use client'

import { useRef, useState } from 'react'
import { CheckCircle, Mic, StopCircle } from 'lucide-react'

import { AudioSpectrum } from '@/components/audio-spectrum'
import { AudioVisualizer } from '@/components/audio-visualizer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAudioEngine } from '@/hooks/use-audio-engine'
import type { DecodedPayload } from '@/lib/audio-engine'

interface HealthDataReceiverProps {
  onDataReceived: (data: DecodedPayload) => void
}

export function HealthDataReceiver({ onDataReceived }: HealthDataReceiverProps) {
  const [isListening, setIsListening] = useState(false)
  const [receivedPayload, setReceivedPayload] = useState<DecodedPayload | null>(null)

  const stopRecordingRef = useRef<(() => void) | null>(null)

  const {
    isInitialized,
    error,
    startListening,
    analysisFrame,
    listeningConfidence,
  } = useAudioEngine()

  const handleStartListening = async () => {
    if (!isInitialized || isListening) return

    const stop = await startListening({
      onData: (payload) => {
        setReceivedPayload(payload)
        onDataReceived(payload)
      },
    })

    if (stop) {
      stopRecordingRef.current = stop
      setIsListening(true)
    }
  }

  const handleStopListening = () => {
    stopRecordingRef.current?.()
    stopRecordingRef.current = null
    setIsListening(false)
  }

  const confidencePercent = Math.round(listeningConfidence * 100)

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Health Data Receiver</h3>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {confidencePercent ? `${confidencePercent}% confidence` : 'Idle'}
        </span>
      </div>

      <AudioVisualizer isActive={isListening} className="mb-4" />
      <AudioSpectrum frame={analysisFrame} />

      <div className="mt-6 space-y-4">
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {receivedPayload && (
          <div className="rounded-2xl border border-accent/40 bg-accent/10 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-accent" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  Payload received ·{' '}
                  <span className="font-mono text-xs uppercase">
                    {receivedPayload.packet?.checksum ?? 'raw'}
                  </span>
                </p>
                <p className="mt-2 font-mono text-xs text-accent/90 break-all">
                  {receivedPayload.packet?.body ?? receivedPayload.raw}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {receivedPayload.packet?.length ?? receivedPayload.raw.length} bytes ·{' '}
                  {receivedPayload.checksumValid ? 'Checksum valid' : 'Checksum mismatch'}
                </p>
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={isListening ? handleStopListening : handleStartListening}
          disabled={!isInitialized}
          variant={isListening ? 'destructive' : 'default'}
          className="w-full"
          size="lg"
        >
          {isListening ? (
            <>
              <StopCircle className="mr-2 h-5 w-5 animate-pulse" />
              Stop Listening
            </>
          ) : (
            <>
              <Mic className="mr-2 h-5 w-5" />
              Start Receiving
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}
