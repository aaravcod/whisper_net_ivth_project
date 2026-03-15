'use client'

import { useRef, useState } from 'react'
import { Mic, StopCircle } from 'lucide-react'

import { AudioSpectrum } from '@/components/audio-spectrum'
import { AudioVisualizer } from '@/components/audio-visualizer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAudioEngine } from '@/hooks/use-audio-engine'
import type { DecodedPayload } from '@/lib/audio-engine'

interface StudentIdDecoderProps {
  onStudentDetected: (studentId: string) => void
}

export function StudentIdDecoder({ onStudentDetected }: StudentIdDecoderProps) {
  const [isListening, setIsListening] = useState(false)
  const [detectedPayloads, setDetectedPayloads] = useState<DecodedPayload[]>([])

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
        setDetectedPayloads(prev => [...prev.slice(-4), payload])
        const candidateId = payload.packet?.body ?? payload.raw
        onStudentDetected(candidateId)
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
        <h3 className="text-lg font-bold text-foreground">Student ID Decoder</h3>
        <span className="rounded-full bg-muted/40 px-3 py-1 text-xs font-semibold text-muted-foreground">
          {confidencePercent ? `${confidencePercent}% confidence` : 'Standby'}
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

        {detectedPayloads.length > 0 && (
          <div className="rounded-xl border border-border/70 bg-card/60 p-4">
            <p className="text-sm text-muted-foreground mb-3">Last transmissions</p>
            <div className="flex flex-wrap gap-2">
              {detectedPayloads
                .slice()
                .reverse()
                .map((payload, idx) => (
                  <span
                    // eslint-disable-next-line react/no-array-index-key
                    key={idx}
                    className="rounded-full bg-primary/10 px-3 py-1 text-xs font-mono text-primary"
                  >
                    {payload.packet?.body ?? payload.raw}
                  </span>
                ))}
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
              Start Listening
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}
