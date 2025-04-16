import React, { useCallback, useEffect, useState } from 'react'
import L from 'leaflet'
import 'leaflet-control-geocoder'
import 'leaflet-control-geocoder/dist/Control.Geocoder.css'
import 'leaflet-routing-machine'
import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import '@/styles/map.css'
import { BusRoute, BusSchedule } from '@/service/bus.service'

interface BusRouteMapProps {
    selectedRoute?: BusRoute | null
    onRouteSelect?: (route: BusRoute) => void
}

const COLORS = [
    '#2ecc71', // xanh lá
    '#e74c3c', // đỏ
    '#f1c40f', // vàng
    '#9b59b6', // tím
    '#3498db', // xanh dương
    '#e67e22', // cam
    '#1abc9c', // ngọc
    '#34495e', // xám đen
]

const createCustomIcon = ({ color }: { color: string }) => {
    return L.divIcon({
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" class="size-6">
            <path fill-rule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742Z" clip-rule="evenodd" />
        </svg>`,
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
    })
}

// Thiết lập icon mặc định cho Leaflet
const DefaultIcon = L.icon({
    iconUrl: '/images/marker-icon.png',
    iconRetinaUrl: '/images/marker-icon-2x.png',
    shadowUrl: '/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

function RouteDisplay({ route }: { route: BusRoute }) {
    const map = useMap()

    useEffect(() => {
        if (!map || !route) return

        // Create coordinates array from route coordinates
        const coordinates = route.routeCoordinates.map(coord => L.latLng(coord.lat, coord.lng))

        // Draw the route line
        const polyline = L.polyline(coordinates, {
            color: '#3498db',
            weight: 6,
            opacity: 0.9,
        }).addTo(map)

        // Fit map bounds to show entire route
        map.fitBounds(polyline.getBounds())

        return () => {
            map.removeLayer(polyline)
        }
    }, [map, route])

    return null
}

export default function BusRouteMap({ selectedRoute, onRouteSelect }: BusRouteMapProps) {
    const [mapCenter] = useState<L.LatLngTuple>([10.840405, 106.843424])

    return (
        <div className="h-screen w-full">
            <MapContainer
                center={mapCenter}
                zoom={15.5}
                style={{ height: '100%', width: '100%' }}
                maxBoundsViscosity={1.0}
                minZoom={16}
                maxZoom={19}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {selectedRoute && (
                    <>
                        <RouteDisplay route={selectedRoute} />
                        {selectedRoute.stops.map((stop, index) => (
                            <Marker
                                key={stop.stopId._id}
                                position={L.latLng(stop.stopId.position.lat, stop.stopId.position.lng)}
                                icon={createCustomIcon({ color: COLORS[index % COLORS.length] })}
                            >
                                <Popup>
                                    <div className="p-2">
                                        <h3 className="font-medium text-lg">{stop.stopId.name}</h3>
                                        <p className="text-gray-600 text-sm">{stop.stopId.description || 'Không có mô tả'}</p>
                                        <p className="text-gray-500 text-sm mt-1">
                                            Khoảng cách từ điểm đầu: {stop.distanceFromStart.toFixed(1)} km
                                        </p>
                                        <p className="text-gray-500 text-sm">
                                            Thời gian ước tính: {stop.estimatedTime} phút
                                        </p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </>
                )}
            </MapContainer>
        </div>
    )
} 