import React, { memo, useCallback, useEffect, useState, useRef } from 'react'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import dynamic from 'next/dynamic'
import { useMap } from 'react-leaflet'
import Image from 'next/image'

import '@/styles/locationselection.css'
import { AVAILABLE_ADDRESS, ERROR_LOG } from '@/constants/map'
import { LocationPoint } from '@/interface/map.interface'
import { isEqual } from '@/utils/index.utils'

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
  onLocationChange: (position: { lat: number; lng: number }, address: string, hasError?: boolean) => void
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

// Add custom hook for debouncing
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

// Centered marker component that remains fixed in the center while map moves
const CenteredMarker = ({
  onMapMoveEnd,
  position
}: {
  onMapMoveEnd: (center: L.LatLng) => void;
  position?: { lat: number; lng: number } | null;
}) => {
  const map = useMap()
  const [centerPosition, setCenterPosition] = useState<L.LatLng>(map.getCenter())
  const [isDragging, setIsDragging] = useState(false)
  const lastMoveTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (position && map.getCenter().distanceTo(L.latLng(position)) > 10) {
      const latLng = L.latLng(position.lat, position.lng);
      map.flyTo(latLng, map.getZoom(), { duration: 1 });
    }
  }, [position]);

  useEffect(() => {
    if (!map) return

    // Position the marker in the center of the map
    const updateCenterPosition = () => {
      setCenterPosition(map.getCenter())
    }

    // Setup event listener for when map movement ends
    const handleMoveEnd = () => {
      const center = map.getCenter()

      // Clear any existing timeout
      if (lastMoveTimerRef.current) {
        clearTimeout(lastMoveTimerRef.current)
      }

      // Set a new timeout - only trigger geocoding after 1.5 seconds of no movement
      lastMoveTimerRef.current = setTimeout(() => {
        onMapMoveEnd(center)

        // Add a small delay to trigger drag end animation
        setTimeout(() => {
          setIsDragging(false)
        }, 50)
      }, 500)
    }

    const handleMoveStart = () => {
      setIsDragging(true)

      // Clear any pending timeout when map starts moving again
      if (lastMoveTimerRef.current) {
        clearTimeout(lastMoveTimerRef.current)
        lastMoveTimerRef.current = null
      }
    }

    // Set initial center position
    updateCenterPosition()

    // Add event listeners
    map.on('move', updateCenterPosition)
    map.on('movestart', handleMoveStart)
    map.on('moveend', handleMoveEnd)
    map.on('zoomend', updateCenterPosition)

    // Clean up
    return () => {
      map.off('move', updateCenterPosition)
      map.off('movestart', handleMoveStart)
      map.off('moveend', handleMoveEnd)
      map.off('zoomend', updateCenterPosition)

      // Clear any pending timeout on unmount
      if (lastMoveTimerRef.current) {
        clearTimeout(lastMoveTimerRef.current)
      }
    }
  }, [map, onMapMoveEnd])

  return null // We're using the CSS-based marker in the parent component
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
    console.log('Reverse geocoding request for - Lat:', lat, 'Lon:', lon)

    // Validate input coordinates
    if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
      console.error('Invalid coordinates provided:', { lat, lon })
      return 'Không xác định được địa chỉ - Invalid coordinates'
    }

    const url = `https://nominatim.openstreetmap.org/reverse.php?lat=${lat}&lon=${lon}&zoom=18&format=json`
    console.log('Request URL:', url)

    const response = await fetch(url)

    if (!response.ok) {
      console.error('HTTP error:', response.status, response.statusText)
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()
    console.log('Geocoding response data:', data)

    if (!data) {
      console.error('Empty response data')
      return 'Không xác định được địa chỉ - Empty response'
    }

    if (data.error) {
      console.error('API returned error:', data.error)
      return 'Không xác định được địa chỉ - API error'
    }

    if (!data.display_name) {
      console.warn('No display_name in response:', data)
    }

    return data.display_name || 'Không xác định được địa chỉ'
  } catch (error) {
    console.error('Reverse geocoding error details:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')

    // Try alternative endpoint format as fallback
    try {
      console.log('Trying alternative endpoint...')
      const altUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      console.log('Alternative URL:', altUrl)

      const altResponse = await fetch(altUrl)
      const altData = await altResponse.json()
      console.log('Alternative endpoint response:', altData)

      return altData.display_name || 'Không xác định được địa chỉ'
    } catch (altError) {
      console.error('Alternative endpoint also failed:', altError)
      return 'Không xác định được địa chỉ - All attempts failed'
    }
  }
}

// Function to validate if address is in Vinhomes Grand Park
const isInVinhomesGrandPark = (address: string): boolean => {
  return address.toLowerCase().includes(AVAILABLE_ADDRESS.NAME_OF_ADDRESS.toLowerCase());
}

const LocationSelection = memo(
  ({ startPoint, onLocationChange, detectUserLocation, loading }: LocationSelectionProps) => {
    const [isFetching, setIsFetching] = useState(false)
    const [isClient, setIsClient] = useState(false)
    const [searchQuery, setSearchQuery] = useState(startPoint.address)
    const [isDragging, setIsDragging] = useState(false)
    const [markerAnimation, setMarkerAnimation] = useState<string>('animate-marker-hover')
    const [locationError, setLocationError] = useState<string | null>(null)
    const [internalPosition, setInternalPosition] = useState(startPoint.position);
    const isProgrammaticUpdate = useRef(false);

    const {
      position: currentPosition,
      error: geolocationError,
      loading: locationLoading,
      getCurrentPosition,
    } = useGeolocation()

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
        // Apply drop-in animation when address changes
        setMarkerAnimation('animate-marker-drop-in')
        const timer = setTimeout(() => {
          setMarkerAnimation('animate-marker-hover')
        }, 600)

        return () => clearTimeout(timer)
      }
    }, [startPoint.address])

    useEffect(() => {
      if (!isEqual(startPoint.position, internalPosition)) {
        isProgrammaticUpdate.current = true;
        setInternalPosition(startPoint.position);
      }
    }, [startPoint.position])



    // Handle map interaction states
    const handleMapInteractionStart = useCallback(() => {
      setIsDragging(true)
      setMarkerAnimation('')
    }, [])

    const handleMapInteractionEnd = useCallback(() => {
      setIsDragging(false)
      setMarkerAnimation('animate-marker-drop-in')

      // Switch back to hover animation after drop completes
      setTimeout(() => {
        setMarkerAnimation('animate-marker-hover')
      }, 600)
    }, [])

    const validateAndUpdateLocation = useCallback((position: { lat: number; lng: number }, address: string) => {
      if (isInVinhomesGrandPark(address)) {
        setLocationError(null)
        onLocationChange(position, address, false)
        return true;
      } else {
        setLocationError(ERROR_LOG.ERROR)
        onLocationChange(position, address, true)
        return false;
      }
    }, [onLocationChange])

    const handleSearch = useCallback(
      async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!searchQuery) return

        try {
          setIsFetching(true)
          const [newLat, newLng] = await geocode(searchQuery)

          // Get full address from coordinates to validate
          const address = await reverseGeocodeOSM(newLat, newLng)

          // Validate if the location is in Vinhomes Grand Park
          const isValid = validateAndUpdateLocation({ lat: newLat, lng: newLng }, address)

          if (isValid) {
            // Set animation state before updating location
            setMarkerAnimation('animate-marker-drop-in')
            setSearchQuery(address)

            // Switch back to hover animation after drop completes
            setTimeout(() => {
              setMarkerAnimation('animate-marker-hover')
            }, 600)
          }
        } catch (error) {
          console.error('Search error:', error)
          setLocationError('Không thể tìm địa chỉ này')
        } finally {
          setIsFetching(false)
        }
      },
      [searchQuery, validateAndUpdateLocation]
    )

    const handleMapMoveEnd = useCallback(
      async (center: L.LatLng) => {
        if (!isEqual({ lat: center.lat, lng: center.lng }, internalPosition)) {
          try {
            setIsFetching(true)
            handleMapInteractionEnd()
            console.log('Map moved - Latitude:', center.lat, 'Longitude:', center.lng)
            console.log('center', center)
            const address = await reverseGeocodeOSM(center.lat, center.lng)
            console.log('address', address)

            // Validate if the location is in Vinhomes Grand Park
            const isValid = validateAndUpdateLocation({ lat: center.lat, lng: center.lng }, address)

            if (isValid) {
              setSearchQuery(address)
            }
          } catch (error) {
            console.error('Map move end error:', error)
            setLocationError('Không thể xác định địa chỉ')
          } finally {
            setIsFetching(false)
          }
        }
      }, [validateAndUpdateLocation, handleMapInteractionEnd])

    const handleDetectLocation = useCallback(async () => {
      try {
        setIsFetching(true)
        getCurrentPosition()

        // Wait for geolocation API to respond
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject)
        })

        const { latitude, longitude } = position.coords
        console.log('Detected location - Latitude:', latitude, 'Longitude:', longitude)
        const address = await reverseGeocodeOSM(latitude, longitude)
        console.log('Detected address:', address)

        // Validate if the location is in Vinhomes Grand Park
        const isValid = validateAndUpdateLocation({ lat: latitude, lng: longitude }, address)

        if (isValid) {
          // Update animation before location change
          setMarkerAnimation('animate-marker-drop-in')
          setSearchQuery(address)

          // Switch back to hover animation after drop completes
          setTimeout(() => {
            setMarkerAnimation('animate-marker-hover')
          }, 600)
        }
      } catch (error) {
        console.error('Error getting location:', error)
        setLocationError('Không thể xác định vị trí hiện tại')
      } finally {
        setIsFetching(false)
      }
    }, [getCurrentPosition, validateAndUpdateLocation])

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
            aria-label="Xác định vị trí hiện tại"
            tabIndex={0}
          >
            {isFetching ? 'Đang tìm...' : 'Vị trí hiện tại'}
          </button>
        </div>

        {locationError && (
          <div className="mt-2 rounded-lg bg-red-100 p-3 text-sm text-red-700">{locationError}</div>
        )}

        <div
          className="map-container relative"
          onMouseDown={handleMapInteractionStart}
          onTouchStart={handleMapInteractionStart}
        >
          <MapContainer
            id="map"
            center={[startPoint.position.lat, startPoint.position.lng]}
            zoom={startPoint.position.lat && startPoint.position.lng ? 15 : 13}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {currentPosition && <CurrentLocationMarker position={currentPosition} />}

            <CenteredMarker
              onMapMoveEnd={handleMapMoveEnd}
              position={internalPosition}
            />
          </MapContainer>

          {/* Fixed center marker */}
          <div className="absolute left-1/2 top-1/2 z-[1000] -translate-x-1/2 -translate-y-full pointer-events-none marker-wrapper">
            <Image
              src="/images/location.png"
              alt="Location marker"
              width={40}
              height={40}
              className={`drop-shadow-lg ${markerAnimation}`}
              priority
            />
          </div>

          {/* Loading indicator */}
          {isFetching && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white bg-opacity-90 px-4 py-2 rounded-full shadow-md text-sm font-medium flex items-center space-x-2 animate-fade-in">
              <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Đang tìm địa chỉ...</span>
            </div>
          )}
        </div>

        {geolocationError && (
          <div className="mt-2 rounded-lg bg-red-100 p-3 text-sm text-red-700">{geolocationError}</div>
        )}
      </div>
    )
  }
)

export default LocationSelection
