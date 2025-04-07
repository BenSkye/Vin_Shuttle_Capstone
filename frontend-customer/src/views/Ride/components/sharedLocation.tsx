import React, { useCallback, useEffect, useRef, useState } from 'react'

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
const Polyline = dynamic(() => import('react-leaflet').then((mod) => mod.Polyline), { ssr: false })

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

interface SharedLocationProps {
  startPoint: {
    position: { lat: number; lng: number }
    address: string
  }
  endPoint: {
    position: { lat: number; lng: number }
    address: string
  }
  onStartLocationChange: (position: { lat: number; lng: number }, address: string) => void
  onEndLocationChange: (position: { lat: number; lng: number }, address: string) => void
  detectUserLocation: () => void
  loading: boolean
  numberOfSeats: number
  onNumberOfSeatsChange: (seats: number) => void
  setEstimateDistance: (distance: number) => void
  setEstimateDuration: (duration: number) => void
}

// Component to display route between two points
const RouteDisplay = ({
  startPoint,
  endPoint,
  onRouteInfoChange,
  setEstimateDistance,
  setEstimateDuration,
}: {
  startPoint: { position: { lat: number; lng: number } }
  endPoint: { position: { lat: number; lng: number } }
  onRouteInfoChange: (info: { distance: number; duration: number } | null) => void
  setEstimateDistance: (distance: number) => void
  setEstimateDuration: (duration: number) => void
}) => {
  const [routePoints, setRoutePoints] = useState<[number, number][]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchRoute = async () => {
      // Only fetch route if both points exist
      if (
        !startPoint.position.lat ||
        !startPoint.position.lng ||
        !endPoint.position.lat ||
        !endPoint.position.lng
      ) {
        onRouteInfoChange(null)
        return
      }

      setIsLoading(true)

      try {
        // Using OSRM public API to get route
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${startPoint.position.lng},${startPoint.position.lat};${endPoint.position.lng},${endPoint.position.lat}?overview=full&geometries=geojson`
        )

        const data = await response.json()

        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          // Get coordinates from the route
          const coords = data.routes[0].geometry.coordinates

          // OSRM returns coordinates as [lng, lat], but Leaflet needs [lat, lng]
          // so we need to reverse each point
          const points: [number, number][] = coords.map((point: [number, number]) => [
            point[1],
            point[0],
          ])

          setRoutePoints(points)

          // Extract distance (in meters) and duration (in seconds) from the API response
          const distanceKm = Math.round(data.routes[0].distance / 100) / 10 // Convert to km and round to 1 decimal
          const durationMin = Math.ceil(data.routes[0].duration / 60) // Convert to minutes and round up

          onRouteInfoChange({
            distance: distanceKm,
            duration: durationMin,
          })
          setEstimateDistance(distanceKm)
          setEstimateDuration(durationMin)
        } else {
          // If no route available, just draw a straight line between points
          setRoutePoints([
            [startPoint.position.lat, startPoint.position.lng],
            [endPoint.position.lat, endPoint.position.lng],
          ])

          // Calculate straight-line distance using Haversine formula
          const R = 6371 // Radius of the earth in km
          const dLat = ((endPoint.position.lat - startPoint.position.lat) * Math.PI) / 180
          const dLon = ((endPoint.position.lng - startPoint.position.lng) * Math.PI) / 180
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((startPoint.position.lat * Math.PI) / 180) *
              Math.cos((endPoint.position.lat * Math.PI) / 180) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2)
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
          const distance = R * c

          // Estimate duration (rough estimate: 1 km = 2 minutes)
          const duration = Math.ceil(distance * 2)

          onRouteInfoChange({
            distance: Math.round(distance * 10) / 10, // Round to 1 decimal
            duration: duration,
          })
        }
      } catch (error) {
        console.error('Error fetching route:', error)
        // Fallback to straight line if route calculation fails
        setRoutePoints([
          [startPoint.position.lat, startPoint.position.lng],
          [endPoint.position.lat, endPoint.position.lng],
        ])

        // Calculate straight-line distance as fallback
        const R = 6371 // Radius of the earth in km
        const dLat = ((endPoint.position.lat - startPoint.position.lat) * Math.PI) / 180
        const dLon = ((endPoint.position.lng - startPoint.position.lng) * Math.PI) / 180
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((startPoint.position.lat * Math.PI) / 180) *
            Math.cos((endPoint.position.lat * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        const distance = R * c

        onRouteInfoChange({
          distance: Math.round(distance * 10) / 10, // Round to 1 decimal
          duration: Math.ceil(distance * 2), // Rough estimate: 1 km = 2 minutes
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchRoute()
  }, [
    startPoint.position.lat,
    startPoint.position.lng,
    endPoint.position.lat,
    endPoint.position.lng,
    onRouteInfoChange,
  ])

  if (routePoints.length === 0) return null

  return (
    <Polyline
      positions={routePoints}
      color="#3b82f6"
      weight={4}
      opacity={0.7}
      dashArray={isLoading ? '10, 10' : ''}
    />
  )
}

// Custom map component that updates view when markers change
const MapUpdater = ({
  startPoint,
  endPoint,
}: {
  startPoint: { position: { lat: number; lng: number } }
  endPoint: { position: { lat: number; lng: number } }
}) => {
  const map = useMap()

  useEffect(() => {
    if (!map) return

    const hasStartPoint = startPoint.position.lat && startPoint.position.lng
    const hasEndPoint = endPoint.position.lat && endPoint.position.lng

    if (hasStartPoint && hasEndPoint) {
      // If both points exist, fit bounds to include both
      const bounds = L.latLngBounds(
        [startPoint.position.lat, startPoint.position.lng],
        [endPoint.position.lat, endPoint.position.lng]
      )
      map.fitBounds(bounds, { padding: [50, 50] })
    } else if (hasStartPoint) {
      map.setView([startPoint.position.lat, startPoint.position.lng], 15)
    } else if (hasEndPoint) {
      map.setView([endPoint.position.lat, endPoint.position.lng], 15)
    }
  }, [map, startPoint.position, endPoint.position])

  return null
}

const MapClickHandler = ({
  onMapClick,
  activePoint,
}: {
  onMapClick: (latlng: L.LatLng) => void
  activePoint: 'start' | 'end'
}) => {
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
  if (!query.trim()) throw new Error('Vui lòng nhập địa chỉ')

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

// Add custom component for current location marker
const CurrentLocationMarker = ({ position }: { position: L.LatLng }) => {
  const [icon] = useState(
    L.divIcon({
      className: 'current-location-marker',
      html: `<div style="width: 20px; height: 20px; background-color: #3B82F6; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    })
  )

  return <Marker position={position} icon={icon} />
}

const SharedLocation = ({
  startPoint,
  endPoint,
  onStartLocationChange,
  onEndLocationChange,
  detectUserLocation,
  loading,
  numberOfSeats,
  onNumberOfSeatsChange,
  setEstimateDistance,
  setEstimateDuration,
}: SharedLocationProps) => {
  const [isFetching, setIsFetching] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [startSearchQuery, setStartSearchQuery] = useState(startPoint.address || '')
  const [endSearchQuery, setEndSearchQuery] = useState(endPoint.address || '')
  const [activePoint, setActivePoint] = useState<'start' | 'end'>('start')
  const [currentPosition, setCurrentPosition] = useState<L.LatLng | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMenuVisible, setIsMenuVisible] = useState(true)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!mapContainerRef.current) return

    if (!document.fullscreenElement) {
      mapContainerRef.current.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }, [])

  // Update search queries when props change
  useEffect(() => {
    if (startPoint.address) setStartSearchQuery(startPoint.address)
  }, [startPoint.address])

  useEffect(() => {
    if (endPoint.address) setEndSearchQuery(endPoint.address)
  }, [endPoint.address])

  const handleSearch = async (e?: React.FormEvent, point: 'start' | 'end' = 'start') => {
    e?.preventDefault()
    const query = point === 'start' ? startSearchQuery : endSearchQuery
    if (!query) return

    try {
      setIsFetching(true)
      setLocationError(null)
      const [newLat, newLng] = await geocode(query)
      if (point === 'start') {
        onStartLocationChange({ lat: newLat, lng: newLng }, query)
      } else {
        onEndLocationChange({ lat: newLat, lng: newLng }, query)
      }
    } catch (error) {
      console.error('Search error:', error)
      setLocationError(error instanceof Error ? error.message : 'Lỗi tìm kiếm địa chỉ')
    } finally {
      setIsFetching(false)
    }
  }

  const handleMapClick = useCallback(
    async (latlng: L.LatLng) => {
      try {
        setIsFetching(true)
        setLocationError(null)
        const address = await reverseGeocodeOSM(latlng.lat, latlng.lng)

        if (activePoint === 'start') {
          onStartLocationChange({ lat: latlng.lat, lng: latlng.lng }, address)
          setStartSearchQuery(address)
        } else {
          onEndLocationChange({ lat: latlng.lat, lng: latlng.lng }, address)
          setEndSearchQuery(address)
        }
      } catch (error) {
        console.error('Map click error:', error)
        setLocationError(error instanceof Error ? error.message : 'Lỗi chọn vị trí trên bản đồ')
      } finally {
        setIsFetching(false)
      }
    },
    [activePoint, onStartLocationChange, onEndLocationChange]
  )

  const handleDetectLocation = async () => {
    try {
      setIsFetching(true)
      setLocationError(null)

      if (!navigator.geolocation) {
        throw new Error('Trình duyệt của bạn không hỗ trợ định vị')
      }

      // Wait for geolocation API to respond
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        })
      })

      const { latitude, longitude } = position.coords
      setCurrentPosition(L.latLng(latitude, longitude))

      const address = await reverseGeocodeOSM(latitude, longitude)

      // Update the location and address immediately
      if (activePoint === 'start') {
        onStartLocationChange({ lat: latitude, lng: longitude }, address)
        setStartSearchQuery(address)
      } else {
        onEndLocationChange({ lat: latitude, lng: longitude }, address)
        setEndSearchQuery(address)
      }

      // Also call the parent's detectUserLocation for consistent state
      detectUserLocation()
    } catch (error) {
      console.error('Error getting location:', error)
      let errorMessage = 'Không thể lấy vị trí của bạn'

      if (error instanceof GeolocationPositionError) {
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
        }
      }

      setLocationError(errorMessage)
    } finally {
      setIsFetching(false)
    }
  }

  if (!isClient) return null

  // Calculate center point between start and end points
  const centerLat = (startPoint.position.lat + endPoint.position.lat) / 2 || 10.840405
  const centerLng = (startPoint.position.lng + endPoint.position.lng) / 2 || 106.843424

  return (
    <div className="w-full space-y-4">
      <div
        ref={mapContainerRef}
        className={`map-container relative overflow-hidden rounded-lg border border-gray-200 shadow-md ${
          isFullscreen ? 'fixed inset-0 z-50 h-screen w-screen rounded-none' : 'h-[400px]'
        }`}
      >
        <MapContainer
          id="map"
          center={[centerLat, centerLng]}
          zoom={12}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {currentPosition && <CurrentLocationMarker position={currentPosition} />}

          {/* Display route if both points are set */}
          {startPoint.position.lat &&
            startPoint.position.lng &&
            endPoint.position.lat &&
            endPoint.position.lng && (
              <RouteDisplay
                startPoint={startPoint}
                endPoint={endPoint}
                onRouteInfoChange={setRouteInfo}
                setEstimateDistance={setEstimateDistance}
                setEstimateDuration={setEstimateDuration}
              />
            )}

          {startPoint.position.lat && startPoint.position.lng && (
            <Marker position={[startPoint.position.lat, startPoint.position.lng]}>
              <Popup className="font-semibold text-blue-600">📍 Điểm đón</Popup>
            </Marker>
          )}

          {endPoint.position.lat && endPoint.position.lng && (
            <Marker
              position={[endPoint.position.lat, endPoint.position.lng]}
              icon={
                new L.Icon({
                  iconUrl:
                    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                  shadowUrl:
                    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                  popupAnchor: [1, -34],
                  shadowSize: [41, 41],
                })
              }
            >
              <Popup className="font-semibold text-red-600">📍 Điểm đến</Popup>
            </Marker>
          )}

          <MapClickHandler onMapClick={handleMapClick} activePoint={activePoint} />
          <MapUpdater startPoint={startPoint} endPoint={endPoint} />
        </MapContainer>

        {/* Toggle Menu Button */}
        <button
          onClick={() => setIsMenuVisible(!isMenuVisible)}
          className="absolute left-1/2 top-4 z-50 -translate-x-1/2 transform rounded-lg bg-white p-2 shadow-md transition-colors hover:bg-gray-50"
          aria-label={isMenuVisible ? 'Ẩn menu' : 'Hiện menu'}
          tabIndex={0}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 transform text-gray-600 transition-transform duration-200 ${isMenuVisible ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="absolute right-4 top-4 z-50 rounded-lg bg-white p-2 shadow-md transition-colors hover:bg-gray-50"
          aria-label={isFullscreen ? 'Thoát chế độ toàn màn hình' : 'Xem toàn màn hình'}
          tabIndex={0}
        >
          {isFullscreen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5 15V5h10v10H5zM3 3v14h14V3H3z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>

        {/* Overlay Control Panel */}
        <div
          className={`absolute left-12 right-4 top-4 transform rounded-lg bg-white p-3 shadow-lg transition-all duration-300 ${
            isMenuVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
          }`}
        >
          <div className="flex flex-col gap-3">
            {/* Start Point Selection */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-sm text-white">
                  1
                </div>
                <h3 className="text-sm font-semibold text-blue-600">Điểm đón</h3>
              </div>
              <form onSubmit={(e) => handleSearch(e, 'start')} className="flex gap-2">
                <input
                  type="text"
                  className={`w-full rounded-lg border p-2 text-sm shadow-sm focus:outline-none focus:ring-2 ${
                    activePoint === 'start'
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-300'
                  }`}
                  placeholder="Nhập địa điểm đón"
                  value={startSearchQuery}
                  onChange={(e) => setStartSearchQuery(e.target.value)}
                  onClick={() => setActivePoint('start')}
                  aria-label="Địa điểm đón"
                  tabIndex={0}
                />

                <button
                  type="button"
                  className="whitespace-nowrap rounded-lg bg-blue-500 px-3 text-sm text-white shadow-md transition-all hover:bg-green-600 disabled:bg-gray-400"
                  onClick={handleDetectLocation}
                  disabled={isFetching || loading}
                  aria-label="Sử dụng vị trí hiện tại làm điểm đón"
                  tabIndex={0}
                >
                  {isFetching ? 'Đang tìm...' : 'Vị trí hiện tại'}
                </button>
              </form>
            </div>

            {/* End Point Selection */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-sm text-white">
                  2
                </div>
                <h3 className="text-sm font-semibold text-red-600">Điểm đến</h3>
              </div>
              <form onSubmit={(e) => handleSearch(e, 'end')} className="flex gap-2">
                <input
                  type="text"
                  className={`w-full rounded-lg border p-2 text-sm shadow-sm focus:outline-none focus:ring-2 ${
                    activePoint === 'end' ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'
                  }`}
                  placeholder="Nhập địa điểm đến"
                  value={endSearchQuery}
                  onChange={(e) => setEndSearchQuery(e.target.value)}
                  onClick={() => setActivePoint('end')}
                  aria-label="Địa điểm đến"
                  tabIndex={0}
                />
                <button
                  type="submit"
                  className="whitespace-nowrap rounded-lg bg-red-500 px-3 text-sm text-white hover:bg-red-600 disabled:bg-gray-400"
                  disabled={isFetching || loading}
                  aria-label="Tìm kiếm địa điểm đến"
                  tabIndex={0}
                >
                  {isFetching ? '...' : 'Tìm'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Map Control Buttons */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform gap-4">
          <button
            className={`rounded-lg px-4 py-2 text-white shadow-md transition-all ${
              activePoint === 'start' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400'
            }`}
            onClick={() => setActivePoint('start')}
            disabled={isFetching || loading}
            aria-label="Chọn điểm đón trên bản đồ"
            tabIndex={0}
          >
            Chọn điểm đón
          </button>
          <button
            className={`rounded-lg px-4 py-2 text-white shadow-md transition-all ${
              activePoint === 'end' ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-400'
            }`}
            onClick={() => setActivePoint('end')}
            disabled={isFetching || loading}
            aria-label="Chọn điểm đến trên bản đồ"
            tabIndex={0}
          >
            Chọn điểm đến
          </button>
        </div>
      </div>

      {/* Seat Selection */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">
            3
          </div>
          <h3 className="text-lg font-semibold text-green-600">Số chỗ ngồi</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNumberOfSeatsChange(Math.max(1, numberOfSeats - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400"
              disabled={numberOfSeats <= 1 || loading}
              aria-label="Giảm số chỗ ngồi"
              tabIndex={0}
            >
              -
            </button>
            <span className="min-w-[3rem] text-center text-lg font-semibold">{numberOfSeats}</span>
            <button
              onClick={() => onNumberOfSeatsChange(Math.min(4, numberOfSeats + 1))}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400"
              disabled={numberOfSeats >= 4 || loading}
              aria-label="Tăng số chỗ ngồi"
              tabIndex={0}
            >
              +
            </button>
          </div>
          <span className="text-sm text-gray-500">Tối đa 4 người cho mỗi chuyến đi chung</span>
        </div>
      </div>

      {/* Trip Information */}
      {routeInfo && (
        <div className="space-y-2 rounded-lg border border-blue-100 bg-blue-50 p-3">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-purple-600">Thông tin chuyến đi</h3>
          </div>
          <div className="ml-10 flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium text-gray-700">{routeInfo.distance} km</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium text-gray-700">Khoảng {routeInfo.duration} phút</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
              </svg>
              <span className="font-medium text-gray-700">{numberOfSeats} chỗ ngồi</span>
            </div>
          </div>
        </div>
      )}

      {locationError && (
        <div
          className="mt-2 rounded-lg bg-red-100 p-3 text-sm text-red-700"
          role="alert"
          aria-live="assertive"
        >
          {locationError}
        </div>
      )}
    </div>
  )
}

export default SharedLocation
