'use client'

import { useState, useEffect } from 'react'

export interface Settings {
  theme: 'light' | 'dark' | 'auto'
  language: string
  autoEncrypt: boolean
  dataRetention: number
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

  // ✅ Load from localStorage safely
  useEffect(() => {
    try {
      const stored = localStorage.getItem('whispernet_settings')

      if (stored) {
        const parsed = JSON.parse(stored)
        setSettings(prev => ({ ...prev, ...parsed }))
      }
    } catch (e) {
      console.error('❌ Failed to load settings:', e)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // ✅ Apply theme (important polish)
  useEffect(() => {
    if (!isLoaded) return

    const root = document.documentElement

    if (settings.theme === 'dark') {
      root.classList.add('dark')
    } else if (settings.theme === 'light') {
      root.classList.remove('dark')
    } else {
      // auto
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', prefersDark)
    }
  }, [settings.theme, isLoaded])

  // ✅ Update setting
  const updateSetting = <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: value }

      try {
        localStorage.setItem('whispernet_settings', JSON.stringify(updated))
      } catch (e) {
        console.error('❌ Failed to save settings:', e)
      }

      return updated
    })
  }

  // ✅ Reset settings
  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS)

    try {
      localStorage.removeItem('whispernet_settings')
    } catch (e) {
      console.error('❌ Failed to reset settings:', e)
    }
  }

  return {
    settings,
    isLoaded,
    updateSetting,
    resetSettings,
  }
}