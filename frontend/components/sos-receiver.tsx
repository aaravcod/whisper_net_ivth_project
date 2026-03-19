'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { AudioVisualizer } from '@/components/audio-visualizer'
import { useAudioEngine } from '@/hooks/use-audio-engine'

export function SOSReceiver() {
  const [isListening, setIsListening] = useState(false)
  const [receiverState, setReceiverState] = useState("IDLE")
  const [receivedSOS, setReceivedSOS] = useState<any>(null)

  const { startListening, isInitialized } = useAudioEngine()

  useEffect(() => {
    if (!isInitialized) return

    let stopFn: any

    const start = async () => {
      const stop = await startListening({
        onData: async (payload) => {
          const message = payload.packet?.body ?? payload.raw

          if (!message.startsWith("SOS:")) return

          setReceiverState("RECEIVING")

          await new Promise(r => setTimeout(r, 600))
          setReceiverState("DECODING")

          await new Promise(r => setTimeout(r, 600))
          setReceiverState("COMPLETE")

          try {
            const decoded = JSON.parse(message.replace("SOS:", ""))
            setReceivedSOS(decoded)
          } catch {
            setReceivedSOS(message)
          }
        }
      })

      stopFn = stop
      setIsListening(true)
      setReceiverState("LISTENING")
    }

    start()

    return () => {
      stopFn?.()
    }
  }, [isInitialized])

  return (
    <Card className="p-4 space-y-4">
      <h3 className="font-bold">SOS Receiver</h3>

      <AudioVisualizer isActive={isListening} state={receiverState} />

      <p className="text-xs text-muted-foreground">State: {receiverState}</p>

      {receivedSOS && (
        <div className="text-sm">
          <p className="font-semibold text-destructive">🚨 SOS Received</p>
          <pre className="text-xs bg-muted p-2 rounded">
            {JSON.stringify(receivedSOS, null, 2)}
          </pre>
        </div>
      )}
    </Card>
  )
}