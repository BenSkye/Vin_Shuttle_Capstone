'use client'

import React, { useEffect, useState } from 'react'
import L from 'leaflet'
import 'leaflet-control-geocoder'
import 'leaflet-control-geocoder/dist/Control.Geocoder.css'
import 'leaflet-routing-machine'
import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, Popup, TileLayer, useMap, Polyline } from 'react-leaflet'
import '@/styles/map.css'
import { BusRoute, BusStop, RouteStop } from '@/service/bus.service'

interface BusRouteMapProps {
    selectedRoute?: BusRoute | null
    allBusStops?: BusStop[]
    showAllStops?: boolean
}

const createBusStopIcon = () => {
    return L.divIcon({
        html: `
        <div class="relative inline-block">
            <div class="relative">
                <div class="absolute -inset-2 animate-ping rounded-full bg-primary-400 opacity-20"></div>
                <div class="relative rounded-full bg-white p-2 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="size-7">
                        <circle cx="12" cy="12" r="10" fill="#22c55e" />
                        <circle cx="12" cy="12" r="8" fill="white" />
                        <path d="M8 8h8v6H8z" fill="#22c55e"/>
                        <path d="M9 14h1.5v1.5H9zM13.5 14H15v1.5h-1.5z" fill="#22c55e"/>
                        <path d="M9 9h6v3H9z" fill="white"/>
                    </svg>
                </div>
            </div>
        </div>`,
        className: 'bus-stop-icon',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
    })
}

function RouteDisplay({ route }: { route: BusRoute }) {
    const map = useMap()

    useEffect(() => {
        if (!map || !route || !route.routeCoordinates) return

        // Create coordinates array from route coordinates
        const coordinates = route.routeCoordinates.map(coord => L.latLng(coord.lat, coord.lng))

        // Fit map bounds to show entire route with padding
        map.fitBounds(L.latLngBounds(coordinates), {
            padding: [50, 50],
            maxZoom: 16
        })

    }, [map, route])

    if (!route.routeCoordinates) return null

    return (
        <Polyline
            positions={route.routeCoordinates.map(coord => [coord.lat, coord.lng])}
            color="#22c55e"
            weight={5}
            opacity={0.8}
        />
    )
}

export default function BusRouteMap({ selectedRoute, allBusStops, showAllStops }: BusRouteMapProps) {
    const [mapCenter] = useState<L.LatLngTuple>([10.840405, 106.843424])

    // Determine which stops to show
    const stopsToShow = selectedRoute
        ? selectedRoute.stops
        : (showAllStops ? allBusStops : [])

    console.log('Stops to Show:', stopsToShow)

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

                {/* Display route if selected */}
                {selectedRoute && <RouteDisplay route={selectedRoute} />}

                {/* Display bus stops */}
                {stopsToShow?.map((stop: RouteStop | BusStop) => {
                    console.log('Processing stop:', stop)

                    // Handle both RouteStop and BusStop types
                    const busStop = 'stopId' in stop ? (stop as RouteStop).stopId : stop as BusStop

                    if (!busStop?.position?.lat || !busStop?.position?.lng) {
                        console.log('Invalid stop position:', busStop)
                        return null
                    }

                    console.log('Rendering stop:', busStop.name, 'at position:', busStop.position)
                    return (
                        <Marker
                            key={busStop._id}
                            position={[busStop.position.lat, busStop.position.lng]}
                            icon={createBusStopIcon()}
                        >
                            <Popup>
                                <div className="p-2">
                                    <h3 className="font-medium text-lg">{busStop.name}</h3>
                                    <p className="text-gray-600 text-sm">{busStop.description || 'Không có mô tả'}</p>
                                    <p className="text-gray-500 text-sm mt-1">{busStop.address}</p>
                                </div>
                            </Popup>
                        </Marker>
                    )
                })}
            </MapContainer>
        </div>
    )
} 