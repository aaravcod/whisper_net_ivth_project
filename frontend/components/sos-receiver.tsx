'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { AudioVisualizer } from '@/components/audio-visualizer'

interface SOSReceiverProps {
  isListening: boolean
}

export function SOSReceiver({ isListening }: SOSReceiverProps) {
  const [receiverState, setReceiverState] = useState("IDLE")
  const [receivedSOS, setReceivedSOS] = useState<any>(null)

  useEffect(() => {
    if (!isListening) {
      setReceiverState("IDLE")
      return
    }

    setReceiverState("LISTENING")

    const interval = setInterval(async () => {
      try {
        const res = await fetch("http://localhost:4000/whisper/listen")
        const data = await res.json()

        console.log("📡 SOS Listen:", data)

        if (data.message && data.message.startsWith("SOS:")) {
          setReceiverState("RECEIVING")

          await new Promise(r => setTimeout(r, 300))
          setReceiverState("DECODING")

          await new Promise(r => setTimeout(r, 300))
          setReceiverState("VALIDATING")

          const raw = data.message.replace("SOS:", "")

          try {
            const parsed = JSON.parse(raw)
            setReceivedSOS(parsed)
          } catch {
            setReceivedSOS(raw)
          }

          setReceiverState("COMPLETE")

          setTimeout(() => {
            setReceiverState("LISTENING")
          }, 1000)
        }

      } catch (err) {
        console.error("❌ Listen error:", err)
        setReceiverState("ERROR")
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isListening])

  return (
    <Card className="p-4 space-y-4">
      <h3 className="font-bold">SOS Receiver</h3>

      <AudioVisualizer isActive={isListening} state={receiverState} />

      <p className="text-xs text-muted-foreground">
        State: <span className="font-mono">{receiverState}</span>
      </p>

      {receivedSOS && (
        <div className="text-sm">
          <p className="font-semibold text-destructive animate-pulse">
            🚨 SOS RECEIVED
          </p>

          <pre className="text-xs bg-muted p-2 rounded overflow-auto">
            {JSON.stringify(receivedSOS, null, 2)}
          </pre>
        </div>
      )}
    </Card>
  )
}