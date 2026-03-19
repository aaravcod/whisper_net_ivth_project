'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface StudentIdDecoderProps {
  onStudentDetected: (data: string) => void
}

export function StudentIdDecoder({ onStudentDetected }: StudentIdDecoderProps) {
  const [isListening, setIsListening] = useState(false)
  const [state, setState] = useState("IDLE")

  useEffect(() => {
    if (!isListening) return

    setState("LISTENING")

    const interval = setInterval(async () => {
      try {
        const res = await fetch("http://localhost:4000/whisper/listen")
        const data = await res.json()

        console.log("📡 Listen:", data)

        if (data.message) {
          setState("RECEIVED")

          // 🔥 IMPORTANT: call safely
          onStudentDetected(data.message)
        }

      } catch (err) {
        console.error("Listen error:", err)
        setState("ERROR")
      }
    }, 1000)

    return () => clearInterval(interval)

    // ✅ ONLY dependency = isListening
  }, [isListening])

  return (
    <Card className="p-4 space-y-4">
      <h3 className="font-bold">Student ID Decoder</h3>

      <p className="text-sm text-muted-foreground">
        State: {state}
      </p>

      <Button
        onClick={() => setIsListening(prev => !prev)}
        className="w-full"
      >
        {isListening ? "Stop Listening" : "Start Listening"}
      </Button>
    </Card>
  )
}