'use client'

export interface PairedDevice {
  id: string
  name: string
  deviceId: string
  publicKey: string
  pairedAt: Date
  lastSeen: Date
  trusted: boolean
}

export class DevicePairingManager {
  private pairedDevices: Map<string, PairedDevice> = new Map()
  private localDeviceId: string

  constructor() {
    this.localDeviceId = this.generateDeviceId()
    this.loadPairedDevices()
  }

  generateDeviceId(): string {
    const stored = localStorage.getItem('whispernet_device_id')
    if (stored) return stored

    const id = `DEVICE_${Math.random().toString(36).substr(2, 12).toUpperCase()}`
    localStorage.setItem('whispernet_device_id', id)
    return id
  }

  pairDevice(name: string, publicKey: string): PairedDevice {
    const device: PairedDevice = {
      id: `PAIRED_${Date.now()}`,
      name,
      deviceId: `DEVICE_${Math.random().toString(36).substr(2, 12).toUpperCase()}`,
      publicKey,
      pairedAt: new Date(),
      lastSeen: new Date(),
      trusted: false,
    }

    this.pairedDevices.set(device.id, device)
    this.savePairedDevices()
    return device
  }

  unpairDevice(deviceId: string): boolean {
    const removed = this.pairedDevices.delete(deviceId)
    if (removed) this.savePairedDevices()
    return removed
  }

  trustDevice(deviceId: string): void {
    const device = this.pairedDevices.get(deviceId)
    if (device) {
      device.trusted = true
      this.savePairedDevices()
    }
  }

  getPairedDevices(): PairedDevice[] {
    return Array.from(this.pairedDevices.values())
  }

  getTrustedDevices(): PairedDevice[] {
    return Array.from(this.pairedDevices.values()).filter(d => d.trusted)
  }

  private savePairedDevices(): void {
    const data = Array.from(this.pairedDevices.values())
    localStorage.setItem('whispernet_paired_devices', JSON.stringify(data))
  }

  private loadPairedDevices(): void {
    const stored = localStorage.getItem('whispernet_paired_devices')
    if (stored) {
      try {
        const devices: PairedDevice[] = JSON.parse(stored)
        devices.forEach(d => {
          d.pairedAt = new Date(d.pairedAt)
          d.lastSeen = new Date(d.lastSeen)
          this.pairedDevices.set(d.id, d)
        })
      } catch (e) {
        console.error('Failed to load paired devices:', e)
      }
    }
  }

  getLocalDeviceId(): string {
    return this.localDeviceId
  }
}
