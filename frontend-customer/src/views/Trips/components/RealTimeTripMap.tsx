'use client'

import { useEffect, useRef } from 'react'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { Marker, Popup, TileLayer } from 'react-leaflet'

import { imgAccess } from '@/constants/imgAccess'
import useTrackingSocket from '@/hooks/useTrackingSocket'

// Dynamic imports để tránh lỗi SSR
const DynamicMapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), {
  ssr: false,
})

// Fix icon marker
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  })
}

interface RealTimeTripMapProps {
  pickupLocation: [number, number]
  vehicleId: string
}

const RealTimeTripMap = ({ pickupLocation, vehicleId }: RealTimeTripMapProps) => {
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const { data: vehicleLocation } = useTrackingSocket(vehicleId)

  // Cập nhật vị trí xe khi có thay đổi
  useEffect(() => {
    console.log('vehicleLocation', vehicleLocation)
    if (vehicleLocation && markerRef.current) {
      const { latitude, longitude, heading } = vehicleLocation
      const newLatLng = L.latLng(latitude, longitude)
      markerRef.current.setLatLng(newLatLng)
      // mapRef.current?.flyTo(newLatLng, mapRef.current.getZoom(), {
      //     animate: true,
      //     duration: 1,
      // });
      markerRef.current.setIcon(createVehicleIcon(heading))
    }
  }, [vehicleLocation])

  const createVehicleIcon = (heading: number) => {
    return L.divIcon({
      className: '',
      html: `<div style="
                width: 14px;
                height: 40px;
                background-image: url('/images/bus-top-view.png');
                background-size: cover;
                transform: rotate(${heading || 0}deg);
            "></div>`,
      iconSize: [20, 20],
      iconAnchor: [7, 20],
    })
  }

  return (
    <div className="h-96 w-full rounded-lg shadow-lg">
      <DynamicMapContainer
        center={pickupLocation}
        zoom={15}
        className="h-full w-full"
        ref={(map) => {
          if (map) {
            mapRef.current = map
          }
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Điểm đón */}
        <Marker position={pickupLocation}>
          <Popup>📍 Điểm đón của bạn</Popup>
        </Marker>

        {/* Vị trí xe */}
        {vehicleLocation && (
          <Marker
            position={[vehicleLocation.latitude, vehicleLocation.longitude]}
            ref={(marker) => {
              if (marker) {
                markerRef.current = marker
              }
            }}
            icon={createVehicleIcon(vehicleLocation.heading)}
          ></Marker>
        )}
      </DynamicMapContainer>
    </div>
  )
}

export default RealTimeTripMap
