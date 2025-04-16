import React, { useEffect, useState } from 'react'
import L from 'leaflet'
import 'leaflet-control-geocoder'
import 'leaflet-control-geocoder/dist/Control.Geocoder.css'
import 'leaflet-routing-machine'
import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import '@/styles/map.css'
import { BusRoute } from '@/service/bus.service'

interface BusRouteMapProps {
    selectedRoute?: BusRoute | null
    onRouteSelect?: (route: BusRoute) => void
}

const createBusStopIcon = () => {
    return L.divIcon({
        html: `
        <div class="relative inline-block">
            <div class="relative">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 48" class="size-8">
                    <rect x="2" y="2" width="36" height="44" rx="4" fill="#f1f5f9" stroke="#475569" stroke-width="2"/>
                    <rect x="2" y="26" width="36" height="20" fill="#ef4444"/>
                    <text x="20" y="41" font-family="Arial" font-size="12" fill="white" text-anchor="middle" font-weight="bold">BUS</text>
                    <path d="M8 8h24v14H8z" fill="#ef4444"/>
                    <path d="M12 12h16v6H12z" fill="#e2e8f0"/>
                    <path d="M13 18h2v2h-2zM25 18h2v2h-2z" fill="#475569"/>
                </svg>
            </div>
        </div>`,
        className: 'bus-stop-icon',
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -40]
    })
}

function RouteDisplay({ route }: { route: BusRoute }) {
    const map = useMap()

    useEffect(() => {
        if (!map || !route) return

        // Create coordinates array from route coordinates
        const coordinates = route.routeCoordinates.map(coord => L.latLng(coord.lat, coord.lng))

        // Draw the route line
        const polyline = L.polyline(coordinates, {
            color: '#22c55e',
            weight: 6,
            opacity: 0.9,
        }).addTo(map)

        // Fit map bounds to show entire route with padding
        map.fitBounds(polyline.getBounds(), {
            padding: [50, 50],
            maxZoom: 16
        })

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
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                maxBoundsViscosity={1.0}
                minZoom={13}
                maxZoom={18}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {selectedRoute && (
                    <>
                        <RouteDisplay route={selectedRoute} />
                        {selectedRoute.stops.map((stop) => (
                            <Marker
                                key={stop.stopId._id}
                                position={L.latLng(stop.stopId.position.lat, stop.stopId.position.lng)}
                                icon={createBusStopIcon()}
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