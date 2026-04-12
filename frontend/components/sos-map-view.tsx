'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import type { LatLngTuple } from 'leaflet'

// ✅ Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
})

export function SOSMapView({ signals = [], userLocation }: any) {

  // ✅ Prevent SSR issues
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // ✅ Use correct keys: latitude / longitude
  const defaultPosition: LatLngTuple =
    userLocation?.latitude && userLocation?.longitude
      ? [userLocation.latitude, userLocation.longitude]
      : [28.6139, 77.2090] // fallback (Delhi)

  // ✅ Force re-render when position updates
  const mapKey = `${defaultPosition[0]}-${defaultPosition[1]}`

  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden border">

      {/* Loading hint */}
      {!userLocation?.latitude && (
        <div className="text-xs text-center p-2 text-muted-foreground">
          📍 Fetching your location...
        </div>
      )}

      {isMounted && (
        <MapContainer
          key={mapKey}
          center={defaultPosition}
          zoom={13}
          scrollWheelZoom={true}
          className="h-full w-full"
        >

          {/* 🌍 OpenStreetMap tiles */}
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* 📍 User Location */}
          {userLocation?.latitude && userLocation?.longitude && (
            <Marker
              position={[
                userLocation.latitude,
                userLocation.longitude,
              ] as LatLngTuple}
            >
              <Popup>📍 You are here</Popup>
            </Marker>
          )}

          {/* 🚨 SOS Signals */}
          {signals.map((signal: any) => {
            if (!signal?.latitude || !signal?.longitude) return null

            return (
              <Marker
                key={signal.id}
                position={[
                  signal.latitude,
                  signal.longitude,
                ] as LatLngTuple}
              >
                <Popup>
                  🚨 {signal.message || 'SOS Alert'}
                </Popup>
              </Marker>
            )
          })}

        </MapContainer>
      )}

    </div>
  )
}