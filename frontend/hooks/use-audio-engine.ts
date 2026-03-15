'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import {
  UltrasonicAudioEngine,
  type AudioEngineConfig,
  type DecodedPayload,
  type EncodedPayload,
  type ListeningFrame,
} from '@/lib/audio-engine'

type StartListeningOptions = {
  onData: (payload: DecodedPayload) => void
}

export function useAudioEngine(config?: Partial<AudioEngineConfig>) {
  const engineRef = useRef<UltrasonicAudioEngine | null>(null)
  const stopRecordingRef = useRef<(() => void) | null>(null)

  const [isInitialized, setIsInitialized] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysisFrame, setAnalysisFrame] = useState<ListeningFrame | null>(null)
  const [listeningConfidence, setListeningConfidence] = useState(0)

  useEffect(() => {
    const initEngine = async () => {
      try {
        const engine = new UltrasonicAudioEngine(config)
        await engine.initialize()
        engineRef.current = engine
        setIsInitialized(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize audio engine')
      }
    }

    initEngine()

    return () => {
      stopRecordingRef.current?.()
      engineRef.current?.dispose()
    }
  }, [config])

  const preparePayload = useCallback((data: string): EncodedPayload | null => {
    if (!engineRef.current) return null
    try {
      return engineRef.current.encodePayload(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Encoding failed')
      return null
    }
  }, [])

  const encodeData = useCallback((data: string): Float32Array | null => {
    const payload = preparePayload(data)
    return payload ? payload.audioBuffer : null
  }, [preparePayload])

  const playAudio = useCallback(async (audioData: Float32Array) => {
    if (!engineRef.current) {
      setError('Audio engine not initialized')
      return
    }
    try {
      await engineRef.current.playAudio(audioData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Playback failed')
    }
  }, [])

  const playPayload = useCallback(
    async (data: string) => {
      const payload = preparePayload(data)
      if (payload) {
        await playAudio(payload.audioBuffer)
      }
      return payload
    },
    [playAudio, preparePayload],
  )

  const startListening = useCallback(
    async ({ onData }: StartListeningOptions) => {
      if (!engineRef.current) {
        setError('Audio engine not initialized')
        return null
      }

      try {
        setIsRecording(true)
        const stop = await engineRef.current.startListening({
          onData: (payload) => {
            setListeningConfidence(payload.confidence)
            onData(payload)
          },
          onFrame: (frame) => {
            setAnalysisFrame(frame)
          },
        })

        stopRecordingRef.current = () => {
          stop()
          setIsRecording(false)
          setAnalysisFrame(null)
          setListeningConfidence(0)
        }

        return stopRecordingRef.current
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Recording failed')
        setIsRecording(false)
        return null
      }
    },
    [],
  )

  const stopListening = useCallback(() => {
    stopRecordingRef.current?.()
    stopRecordingRef.current = null
  }, [])

  return {
    isInitialized,
    isRecording,
    error,
    preparePayload,
    encodeData,
    playAudio,
    playPayload,
    startListening,
    stopListening,
    analysisFrame,
    listeningConfidence,
  }
}
