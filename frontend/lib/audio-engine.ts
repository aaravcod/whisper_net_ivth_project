// Ultrasonic Audio Engine for WhisperNet
// Handles encoding/decoding data using ultrasonic frequencies

export interface AudioEngineConfig {
  carrierFrequency: number // Ultrasonic carrier frequency (Hz)
  baudRate: number // Bits per second
  baseFrequency: number // Base frequency for FSK modulation
  frequencyShift: number // Frequency shift for bit 1
  sampleRate: number // Audio sample rate (Hz)
}

export interface WhisperPayload {
  version: number
  timestamp: number
  body: string
  checksum: string
  length: number
}

export interface EncodedPayload {
  packet: WhisperPayload
  binary: string
  audioBuffer: Float32Array
}

export interface DecodedPayload {
  raw: string
  packet?: WhisperPayload
  checksumValid: boolean
  confidence: number
}

export interface ListeningFrame {
  fft: Uint8Array
  dominantFrequency: number
  confidence: number
  timestamp: number
}

export interface ListeningOptions {
  onData: (payload: DecodedPayload) => void
  onFrame?: (frame: ListeningFrame) => void
}

export const DEFAULT_CONFIG: AudioEngineConfig = {
  carrierFrequency: 18000, // 18kHz ultrasonic frequency
  baudRate: 100,
  baseFrequency: 18000,
  frequencyShift: 1000,
  sampleRate: 44100,
}

export class UltrasonicAudioEngine {
  private audioContext: AudioContext | null = null
  private config: AudioEngineConfig

  constructor(config: Partial<AudioEngineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  async initialize(): Promise<void> {
    if (this.audioContext) return
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }

  encodePayload(data: string): EncodedPayload {
    if (!this.audioContext) {
      throw new Error('Audio engine not initialized')
    }

    const packet: WhisperPayload = {
      version: 1,
      timestamp: Date.now(),
      body: data,
      checksum: this.computeChecksum(data),
      length: data.length,
    }

    const payloadString = JSON.stringify(packet)
    const binary = this.stringToBinary(payloadString)
    const audioBuffer = this.buildAudioFromBinary(binary)

    return {
      packet,
      binary,
      audioBuffer,
    }
  }

  encodeData(data: string): Float32Array {
    if (!this.audioContext) {
      throw new Error('Audio engine not initialized')
    }
    const binaryData = this.stringToBinary(data)
    return this.buildAudioFromBinary(binaryData)
  }

  async playAudio(audioData: Float32Array): Promise<void> {
    if (!this.audioContext) {
      throw new Error('Audio engine not initialized')
    }

    const audioBuffer = this.audioContext.createBuffer(1, audioData.length, this.config.sampleRate)
    audioBuffer.getChannelData(0).set(audioData)

    const source = this.audioContext.createBufferSource()
    source.buffer = audioBuffer

    const gainNode = this.audioContext.createGain()
    gainNode.gain.value = 0.5
    source.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    source.start(0)
  }

  async startListening(options: ListeningOptions): Promise<() => void> {
    if (!this.audioContext) {
      throw new Error('Audio engine not initialized')
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const source = this.audioContext.createMediaStreamSource(stream)
    const analyser = this.audioContext.createAnalyser()
    analyser.fftSize = 4096
    source.connect(analyser)

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    let decodedBits = ''
    let silenceCounter = 0
    let isDetected = false
    let rafId: number | null = null
    let confidenceSum = 0
    let confidenceSamples = 0

    const processAudio = () => {
      analyser.getByteFrequencyData(dataArray)

      const { hasSignal, dominantFrequency, confidence } = this.analyzeSpectrum(dataArray)
      const timestamp = performance.now()

      if (options.onFrame) {
        options.onFrame({
          fft: Uint8Array.from(dataArray),
          dominantFrequency,
          confidence,
          timestamp,
        })
      }

      if (hasSignal) {
        silenceCounter = 0
        confidenceSum += confidence
        confidenceSamples++

        if (!isDetected) {
          isDetected = true
          decodedBits = ''
        }

        const bitThreshold = this.config.baseFrequency + this.config.frequencyShift / 2
        const bit = dominantFrequency > bitThreshold ? '1' : '0'
        decodedBits += bit
      } else {
        silenceCounter++
        if (isDetected && silenceCounter > 10) {
          if (decodedBits.length > 0) {
            this.emitDecodedPayload(decodedBits, confidenceSum, confidenceSamples, options.onData)
          }
          decodedBits = ''
          isDetected = false
          silenceCounter = 0
          confidenceSum = 0
          confidenceSamples = 0
        }
      }

      rafId = requestAnimationFrame(processAudio)
    }

    processAudio()

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
      stream.getTracks().forEach(track => track.stop())
    }
  }

  getSampleRate(): number {
    return this.audioContext?.sampleRate || this.config.sampleRate
  }

  dispose(): void {
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
  }

  private emitDecodedPayload(
    binary: string,
    confidenceSum: number,
    confidenceSamples: number,
    onData: (payload: DecodedPayload) => void,
  ) {
    try {
      const decodedData = this.binaryToString(binary)
      let packet: WhisperPayload | undefined
      let checksumValid = false

      try {
        packet = JSON.parse(decodedData) as WhisperPayload
        checksumValid = packet.checksum === this.computeChecksum(packet.body)
      } catch (err) {
        console.warn('Unable to parse payload packet', err)
      }

      onData({
        raw: decodedData,
        packet,
        checksumValid,
        confidence: confidenceSamples ? confidenceSum / confidenceSamples : 0,
      })
    } catch (error) {
      console.error('Decode error:', error)
    }
  }

  private analyzeSpectrum(dataArray: Uint8Array) {
    const threshold = 40
    let peakValue = 0
    let peakIndex = 0

    let signalEnergy = 0
    let totalEnergy = 0

    for (let i = 0; i < dataArray.length; i++) {
      const value = dataArray[i]
      totalEnergy += value
      if (value > peakValue) {
        peakValue = value
        peakIndex = i
      }
    }

    const dominantFrequency = (peakIndex * this.config.sampleRate) / analyserFftSize(this.audioContext)

    const baseFreq = this.config.baseFrequency
    const upperBound = baseFreq + this.config.frequencyShift * 2
    for (let i = 0; i < dataArray.length; i++) {
      const freq = (i * this.config.sampleRate) / analyserFftSize(this.audioContext)
      if (freq >= baseFreq && freq <= upperBound) {
        signalEnergy += dataArray[i]
      }
    }

    const confidence = totalEnergy === 0 ? 0 : Math.min(signalEnergy / totalEnergy, 1)

    return {
      hasSignal: peakValue > threshold,
      dominantFrequency,
      confidence,
    }
  }

  private buildAudioFromBinary(binaryData: string): Float32Array {
    const duration = binaryData.length / this.config.baudRate + 0.5
    const sampleCount = Math.ceil(duration * this.config.sampleRate)
    const audioBuffer = new Float32Array(sampleCount)

    let sampleIndex = 0
    const samplesPerBit = this.config.sampleRate / this.config.baudRate

    const preambleSamples = Math.ceil(0.2 * this.config.sampleRate)
    sampleIndex += preambleSamples

    const detectionDuration = 0.1
    const detectionSamples = Math.ceil(detectionDuration * this.config.sampleRate)
    for (let i = 0; i < detectionSamples && sampleIndex < sampleCount; i++) {
      const t = sampleIndex / this.config.sampleRate
      const phase = 2 * Math.PI * this.config.carrierFrequency * t
      audioBuffer[sampleIndex] = Math.sin(phase) * 0.3
      sampleIndex++
    }

    for (let bitIndex = 0; bitIndex < binaryData.length; bitIndex++) {
      const bit = binaryData[bitIndex] === '1' ? 1 : 0
      const frequency = this.config.baseFrequency + bit * this.config.frequencyShift

      for (let i = 0; i < samplesPerBit && sampleIndex < sampleCount; i++) {
        const t = sampleIndex / this.config.sampleRate
        const phase = 2 * Math.PI * frequency * t
        audioBuffer[sampleIndex] = Math.sin(phase) * 0.3
        sampleIndex++
      }
    }

    return audioBuffer
  }

  private stringToBinary(str: string): string {
    return str
      .split('')
      .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
      .join('')
  }

  private binaryToString(binary: string): string {
    const cleanBinary = binary.slice(0, Math.floor(binary.length / 8) * 8)
    let result = ''
    for (let i = 0; i < cleanBinary.length; i += 8) {
      const byte = cleanBinary.substring(i, i + 8)
      const charCode = parseInt(byte, 2)
      if (!Number.isNaN(charCode) && charCode > 0) {
        result += String.fromCharCode(charCode)
      }
    }
    return result
  }

  private computeChecksum(input: string): string {
    let hash = 0
    for (let i = 0; i < input.length; i++) {
      hash = (hash + input.charCodeAt(i)) % 65535
    }
    return hash.toString(16).padStart(4, '0')
  }
}

function analyserFftSize(audioContext: AudioContext | null): number {
  // Align with analyser.fftSize used in startListening (4096)
  return 4096
}
