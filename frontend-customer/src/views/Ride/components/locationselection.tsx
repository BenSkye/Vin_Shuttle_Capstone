import React, { useEffect, useState, useCallback, memo } from 'react'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import dynamic from 'next/dynamic'
import { useMap } from 'react-leaflet'

import '@/styles/locationselection.css'

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

// Add custom hook for geolocation
const useGeolocation = () => {
  const [position, setPosition] = useState<L.LatLng | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const getCurrentPosition = () => {
    setLoading(true)
    setError(null)

    if (!navigator.geolocation) {
      setError('Trình duyệt của bạn không hỗ trợ định vị')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setPosition(L.latLng(latitude, longitude))
        setLoading(false)
      },
      (error) => {
        let errorMessage = 'Không thể lấy vị trí của bạn'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Bạn đã từ chối cho phép truy cập vị trí'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Không thể lấy thông tin vị trí'
            break
          case error.TIMEOUT:
            errorMessage = 'Yêu cầu vị trí đã hết thời gian chờ'
            break
          default:
            errorMessage = 'Đã xảy ra lỗi không xác định'
        }
        setError(errorMessage)
        setLoading(false)
      }
    )
  }

  return { position, error, loading, getCurrentPosition }
}

// Add custom component for current location marker
const CurrentLocationMarker = ({ position }: { position: L.LatLng }) => {
  const map = useMap()
  const [icon] = useState(
    L.divIcon({
      className: 'current-location-marker',
      html: '<div class="current-location-dot"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    })
  )

  useEffect(() => {
    map.setView(position, 15)
  }, [position, map])

  return <Marker position={position} icon={icon} />
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
    const data = await response.json()
    return data.display_name || 'Không xác định được địa chỉ'
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    throw new Error('Không thể lấy địa chỉ từ tọa độ')
  }
}

const LocationSelection = memo(({
  startPoint,
  onLocationChange,
  detectUserLocation,
  loading,
}: LocationSelectionProps) => {
  const [isFetching, setIsFetching] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [searchQuery, setSearchQuery] = useState(startPoint.address)
  const { position: currentPosition, error: locationError, loading: locationLoading, getCurrentPosition } = useGeolocation()

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

  useEffect(() => {
    if (startPoint.address && startPoint.address !== searchQuery) {
      setSearchQuery(startPoint.address)
    }
  }, [startPoint.address])

  const handleSearch = useCallback(async (e?: React.FormEvent) => {
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
  }, [searchQuery, onLocationChange])

  const handleMapClick = useCallback(async (latlng: L.LatLng) => {
    try {
      setIsFetching(true)
      const address = await reverseGeocodeOSM(latlng.lat, latlng.lng)
      onLocationChange({ lat: latlng.lat, lng: latlng.lng }, address)
      setSearchQuery(address)
    } catch (error) {
      console.error('Map click error:', error)
    } finally {
      setIsFetching(false)
    }
  }, [onLocationChange])

  const handleDetectLocation = useCallback(async () => {
    try {
      setIsFetching(true);
      getCurrentPosition();

      // Wait for geolocation API to respond
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      const address = await reverseGeocodeOSM(latitude, longitude);

      // Update the location and address immediately
      onLocationChange({ lat: latitude, lng: longitude }, address);
      setSearchQuery(address);
    } catch (error) {
      console.error('Error getting location:', error);
    } finally {
      setIsFetching(false);
    }
  }, [getCurrentPosition, onLocationChange]);

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
          className="rounded-lg bg-blue-500 p-3 text-white shadow-md transition-all hover:bg-green-600 disabled:bg-gray-400"
          onClick={handleDetectLocation}
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

          {currentPosition && <CurrentLocationMarker position={currentPosition} />}

          {startPoint.position.lat && startPoint.position.lng && (
            <Marker position={[startPoint.position.lat, startPoint.position.lng]}>
              <Popup className="font-semibold">📍 Điểm đón của bạn</Popup>
            </Marker>
          )}

          <MapClickHandler onMapClick={handleMapClick} />
        </MapContainer>
      </div>

      {locationError && (
        <div className="mt-2 rounded-lg bg-red-100 p-3 text-sm text-red-700">
          {locationError}
        </div>
      )}
    </div>
  )
})

export default LocationSelection
