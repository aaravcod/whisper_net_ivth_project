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

  // 🔥 NEW STATES
  const [receiverState, setReceiverState] = useState("IDLE")
  const [currentSignal, setCurrentSignal] = useState<any>(null)

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
      onData: async (payload) => {
        // 🔥 SIMULATED RECEIVER FLOW
        setReceiverState("RECEIVING")
        setCurrentSignal(payload)

        await new Promise(res => setTimeout(res, 700))

        setReceiverState("DECODING")
        await new Promise(res => setTimeout(res, 700))

        setReceiverState("VALIDATING")
        await new Promise(res => setTimeout(res, 500))

        setDetectedPayloads(prev => [...prev.slice(-4), payload])

        const candidateId = payload.packet?.body ?? payload.raw

        setReceiverState("COMPLETE")

        onStudentDetected(candidateId)

        setTimeout(() => {
          setReceiverState("LISTENING")
        }, 1000)
      },
    })

    if (stop) {
      stopRecordingRef.current = stop
      setIsListening(true)
      setReceiverState("LISTENING") // 🔥 important
    }
  }

  const handleStopListening = () => {
    stopRecordingRef.current?.()
    stopRecordingRef.current = null
    setIsListening(false)
    setReceiverState("IDLE")
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

      {/* 🔥 VISUALIZER */}
      <AudioVisualizer isActive={isListening} state={receiverState} className="mb-4" />

      {/* 🔥 RECEIVER STATUS */}
      <div className="rounded-xl border border-border/70 bg-muted/30 p-3 text-xs mb-4">
        <p className="text-muted-foreground mb-1">Receiver Status</p>
        <p className="font-mono text-primary">{receiverState}</p>
      </div>

      {/* 🔥 SIGNAL INFO */}
      {currentSignal && (
        <div className="rounded-xl border border-border/70 bg-muted/20 p-3 text-xs mb-4">
          <p className="text-muted-foreground mb-1">Incoming Signal</p>
          <p className="font-mono text-primary">
            {currentSignal.packet?.body ?? currentSignal.raw}
          </p>
        </div>
      )}

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