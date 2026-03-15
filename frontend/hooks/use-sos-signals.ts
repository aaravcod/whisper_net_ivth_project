'use client'

import { useState, useCallback } from 'react'
import { SOSSignal } from '@/lib/types'

export interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
}

export function useSOSSignals() {
  const [signals, setSignals] = useState<SOSSignal[]>([])
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null)

  const getCurrentLocation = useCallback(async (): Promise<LocationData | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.error('Geolocation not supported')
        resolve(null)
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          }
          setCurrentLocation(location)
          resolve(location)
        },
        (error) => {
          console.error('Geolocation error:', error)
          resolve(null)
        }
      )
    })
  }, [])

  const broadcastSOSSignal = useCallback(
    async (message: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'critical') => {
      const location = await getCurrentLocation()

      if (!location) {
        console.error('Unable to get location')
        return null
      }

      const signal: SOSSignal = {
        id: Date.now().toString(),
        senderId: `USER_${Math.random().toString(36).substr(2, 9)}`,
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: new Date(),
        message,
        severity,
      }

      setSignals(prev => [signal, ...prev])
      return signal
    },
    [getCurrentLocation]
  )

  const encodeSOSData = useCallback((signal: SOSSignal): string => {
    return `SOS|SENDER:${signal.senderId}|LAT:${signal.latitude}|LON:${signal.longitude}|SEV:${signal.severity}|MSG:${signal.message}|TIME:${signal.timestamp.toISOString()}`
  }, [])

  const getSignalsNearby = useCallback(
    (radiusKm: number = 5): SOSSignal[] => {
      if (!currentLocation) return []

      return signals.filter(signal => {
        const distance = calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          signal.latitude,
          signal.longitude
        )
        return distance <= radiusKm
      })
    },
    [signals, currentLocation]
  )

  return {
    signals,
    currentLocation,
    broadcastSOSSignal,
    encodeSOSData,
    getSignalsNearby,
    getCurrentLocation,
  }
}

// Haversine formula to calculate distance between coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
