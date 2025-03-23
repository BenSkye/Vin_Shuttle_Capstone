import React, { useEffect, useState } from 'react'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import dynamic from 'next/dynamic'
import { useMap } from 'react-leaflet'

import '../../../../../styles/locationselection.css'

// Dynamic imports
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), {
  ssr: false,
})
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), {
  ssr: false,
})
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false })

// Fix icon chỉ ở phía client
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  })
}

interface LocationSelectionProps {
  startPoint: {
    position: { lat: number; lng: number }
    address: string
  }
  onLocationChange: (position: { lat: number; lng: number }, address: string) => void
  detectUserLocation: () => void
  loading: boolean
}

const MapClickHandler = ({ onMapClick }: { onMapClick: (latlng: L.LatLng) => void }) => {
  const map = useMap()

  useEffect(() => {
    if (!map || typeof window === 'undefined') return

    const handleClick = (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng)
    }

    map.on('click', handleClick)
    return () => {
      map.off('click', handleClick)
    }
  }, [map, onMapClick])

  return null
}

// Hàm geocode để tìm kiếm địa chỉ
const geocode = async (query: string): Promise<[number, number]> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
    )
    const data = await response.json()

    if (!data || data.length === 0) throw new Error('Không tìm thấy địa chỉ')

    return [parseFloat(data[0].lat), parseFloat(data[0].lon)]
  } catch (error) {
    console.error('Geocoding error:', error)
    throw new Error('Không thể tìm tọa độ từ địa chỉ')
  }
}

// Hàm reverse geocode
const reverseGeocodeOSM = async (lat: number, lon: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse.php?lat=${lat}&lon=${lon}&zoom=18&format=json`
    )
    console.log(
      `https://nominatim.openstreetmap.org/reverse.php?lat=${lat}&lon=${lon}&zoom=18&format=json`
    )
    const data = await response.json()
    console.log('data', data)
    return data.display_name || 'Không xác định được địa chỉ'
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    throw new Error('Không thể lấy địa chỉ từ tọa độ')
  }
}

const LocationSelection = ({
  startPoint,
  onLocationChange,
  detectUserLocation,
  loading,
}: LocationSelectionProps) => {
  const [isFetching, setIsFetching] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [searchQuery, setSearchQuery] = useState(startPoint.address)

  useEffect(() => {
    setIsClient(true)
    if (typeof window !== 'undefined') {
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      })
    }
  }, [])

  // useEffect(() => {
  //     setIsClient(true);
  // }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!searchQuery) return

    try {
      setIsFetching(true)
      const [newLat, newLng] = await geocode(searchQuery)
      onLocationChange({ lat: newLat, lng: newLng }, searchQuery)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsFetching(false)
    }
  }

  const handleMapClick = async (latlng: L.LatLng) => {
    try {
      setIsFetching(true)
      const address = await reverseGeocodeOSM(latlng.lat, latlng.lng)
      onLocationChange({ lat: latlng.lat, lng: latlng.lng }, address)
      setSearchQuery(address)

      // Force update map view
      const map = L.map('map')
      map.setView(latlng, 15)
    } catch (error) {
      console.error('Map click error:', error)
    } finally {
      setIsFetching(false)
    }
  }

  if (!isClient) return null

  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            className="w-full rounded-lg border p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập địa điểm đón"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-500 px-4 text-white hover:bg-blue-600 disabled:bg-gray-400"
            disabled={isFetching || loading}
          >
            {isFetching ? '...' : 'Tìm'}
          </button>
        </form>
        <button
          className="rounded-lg bg-blue-500 p-3 text-white shadow-md transition-all hover:bg-blue-600"
          onClick={detectUserLocation}
          disabled={isFetching || loading}
        >
          {isFetching ? 'Đang tìm...' : 'Vị trí hiện tại'}
        </button>
      </div>

      <div className="map-container">
        <MapContainer
          id="map"
          center={[startPoint.position.lat || 10.840405, startPoint.position.lng || 106.843424]}
          zoom={startPoint.position.lat && startPoint.position.lng ? 15 : 13}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {startPoint.position.lat && startPoint.position.lng && (
            <Marker position={[startPoint.position.lat, startPoint.position.lng]}>
              <Popup className="font-semibold">📍 Điểm đón của bạn</Popup>
            </Marker>
          )}

          <MapClickHandler onMapClick={handleMapClick} />
        </MapContainer>
      </div>
    </div>
  )
}

export default LocationSelection
