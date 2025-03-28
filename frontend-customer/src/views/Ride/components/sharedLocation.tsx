import React, { useEffect, useState } from 'react'

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
}

const MapClickHandler = ({
    onMapClick,
    activePoint
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

const SharedLocation = ({
    startPoint,
    endPoint,
    onStartLocationChange,
    onEndLocationChange,
    detectUserLocation,
    loading,
    numberOfSeats,
    onNumberOfSeatsChange,
}: SharedLocationProps) => {
    const [isFetching, setIsFetching] = useState(false)
    const [isClient, setIsClient] = useState(false)
    const [startSearchQuery, setStartSearchQuery] = useState(startPoint.address)
    const [endSearchQuery, setEndSearchQuery] = useState(endPoint.address)
    const [activePoint, setActivePoint] = useState<'start' | 'end'>('start')
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

    const handleSearch = async (e?: React.FormEvent, point: 'start' | 'end' = 'start') => {
        e?.preventDefault()
        const query = point === 'start' ? startSearchQuery : endSearchQuery
        if (!query) return

        try {
            setIsFetching(true)
            const [newLat, newLng] = await geocode(query)
            if (point === 'start') {
                onStartLocationChange({ lat: newLat, lng: newLng }, query)
            } else {
                onEndLocationChange({ lat: newLat, lng: newLng }, query)
            }
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
            if (activePoint === 'start') {
                onStartLocationChange({ lat: latlng.lat, lng: latlng.lng }, address)
                setStartSearchQuery(address)
            } else {
                onEndLocationChange({ lat: latlng.lat, lng: latlng.lng }, address)
                setEndSearchQuery(address)
            }

            // Force update map view
            const map = L.map('map')
            map.setView(latlng, 15)
        } catch (error) {
            console.error('Map click error:', error)
        } finally {
            setIsFetching(false)
        }
    }

    const handleDetectLocation = async () => {
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
            if (activePoint === 'start') {
                onStartLocationChange({ lat: latitude, lng: longitude }, address);
                setStartSearchQuery(address);
            } else {
                onEndLocationChange({ lat: latitude, lng: longitude }, address);
                setEndSearchQuery(address);
            }
        } catch (error) {
            console.error('Error getting location:', error);
        } finally {
            setIsFetching(false);
        }
    };

    if (!isClient) return null

    // Calculate center point between start and end points
    const centerLat = (startPoint.position.lat + endPoint.position.lat) / 2 || 10.840405
    const centerLng = (startPoint.position.lng + endPoint.position.lng) / 2 || 106.843424

    return (
        <div className="w-full space-y-4">
            <div className="flex flex-col space-y-4">
                {/* Start Point Selection */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white">
                            1
                        </div>
                        <h3 className="text-lg font-semibold text-blue-600">Điểm đón</h3>
                    </div>
                    <form onSubmit={(e) => handleSearch(e, 'start')} className="flex gap-2">
                        <input
                            type="text"
                            className="w-full rounded-lg border p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nhập địa điểm đón"
                            value={startSearchQuery}
                            onChange={(e) => setStartSearchQuery(e.target.value)}
                        />

                        <button
                            type="button"
                            className="rounded-lg bg-blue-500 px-4 text-white shadow-md transition-all hover:bg-green-600 disabled:bg-gray-400"
                            onClick={handleDetectLocation}
                            disabled={isFetching || loading}
                        >
                            {isFetching ? 'Đang tìm...' : 'Vị trí hiện tại'}
                        </button>
                    </form>
                </div>

                {/* End Point Selection */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white">
                            2
                        </div>
                        <h3 className="text-lg font-semibold text-red-600">Điểm đến</h3>
                    </div>
                    <form onSubmit={(e) => handleSearch(e, 'end')} className="flex gap-2">
                        <input
                            type="text"
                            className="w-full rounded-lg border p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Nhập địa điểm đến"
                            value={endSearchQuery}
                            onChange={(e) => setEndSearchQuery(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="rounded-lg bg-red-500 px-4 text-white hover:bg-red-600 disabled:bg-gray-400"
                            disabled={isFetching || loading}
                        >
                            {isFetching ? '...' : 'Tìm'}
                        </button>
                    </form>
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
                            >
                                -
                            </button>
                            <span className="min-w-[3rem] text-center text-lg font-semibold">
                                {numberOfSeats}
                            </span>
                            <button
                                onClick={() => onNumberOfSeatsChange(Math.min(4, numberOfSeats + 1))}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400"
                                disabled={numberOfSeats >= 4 || loading}
                            >
                                +
                            </button>
                        </div>
                        <span className="text-sm text-gray-500">
                            Tối đa 4 người cho mỗi chuyến đi chung
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex justify-center gap-4">
                <button
                    className={`rounded-lg px-4 py-2 text-white shadow-md transition-all ${activePoint === 'start' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400'
                        }`}
                    onClick={() => setActivePoint('start')}
                    disabled={isFetching || loading}
                >
                    Chọn điểm đón
                </button>
                <button
                    className={`rounded-lg px-4 py-2 text-white shadow-md transition-all ${activePoint === 'end' ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-400'
                        }`}
                    onClick={() => setActivePoint('end')}
                    disabled={isFetching || loading}
                >
                    Chọn điểm đến
                </button>
            </div>

            <div className="map-container">
                <MapContainer
                    id="map"
                    center={[centerLat, centerLng]}
                    zoom={startPoint.position.lat && endPoint.position.lat ? 13 : 12}
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {currentPosition && <CurrentLocationMarker position={currentPosition} />}

                    {startPoint.position.lat && startPoint.position.lng && (
                        <Marker position={[startPoint.position.lat, startPoint.position.lng]}>
                            <Popup className="font-semibold text-blue-600">📍 Điểm đón</Popup>
                        </Marker>
                    )}

                    {endPoint.position.lat && endPoint.position.lng && (
                        <Marker position={[endPoint.position.lat, endPoint.position.lng]}>
                            <Popup className="font-semibold text-red-600">📍 Điểm đến</Popup>
                        </Marker>
                    )}

                    <MapClickHandler onMapClick={handleMapClick} activePoint={activePoint} />
                </MapContainer>
            </div>

            {locationError && (
                <div className="mt-2 rounded-lg bg-red-100 p-3 text-sm text-red-700">
                    {locationError}
                </div>
            )}
        </div>
    )
}

export default SharedLocation
