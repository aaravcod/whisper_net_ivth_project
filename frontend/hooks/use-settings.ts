'use client'

import { useState, useEffect } from 'react'

export interface Settings {
  theme: 'light' | 'dark' | 'auto'
  language: string
  autoEncrypt: boolean
  dataRetention: number // days
  allowPublicDiscovery: boolean
  microphoneEnabled: boolean
  locationSharing: boolean
  notificationsEnabled: boolean
  soundAlerts: boolean
}

const DEFAULT_SETTINGS: Settings = {
  theme: 'auto',
  language: 'en',
  autoEncrypt: true,
  dataRetention: 30,
  allowPublicDiscovery: false,
  microphoneEnabled: true,
  locationSharing: false,
  notificationsEnabled: true,
  soundAlerts: true,
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('whispernet_settings')
    if (stored) {
      try {
        setSettings(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to load settings:', e)
      }
    }
    setIsLoaded(true)
  }, [])

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]): void => {
    setSettings(prev => {
      const updated = { ...prev, [key]: value }
      localStorage.setItem('whispernet_settings', JSON.stringify(updated))
      return updated
    })
  }

  const resetSettings = (): void => {
    setSettings(DEFAULT_SETTINGS)
    localStorage.removeItem('whispernet_settings')
  }

  return {
    settings,
    isLoaded,
    updateSetting,
    resetSettings,
  }
}
