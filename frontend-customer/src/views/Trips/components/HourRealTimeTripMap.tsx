'use client'

import { useEffect, useRef, useState, useMemo, memo, useCallback } from 'react'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { Marker, Popup, TileLayer, useMap } from 'react-leaflet'

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

// Custom vehicle marker
const createVehicleIcon = (heading: number = 0) => {
    return L.divIcon({
        className: '',
        html: `<div style="
              width: 14px;
              height: 40px;
              background-image: url('/images/bus-top-view.png');
              background-size: cover;
              transform: rotate(${heading}deg);
          "></div>`,
        iconSize: [20, 20],
        iconAnchor: [7, 20],
    })
}

// Helper function to check if two positions are the same
const arePositionsEqual = (pos1: L.LatLng, pos2: L.LatLng, threshold = 0.0000001) => {
    return Math.abs(pos1.lat - pos2.lat) < threshold && Math.abs(pos1.lng - pos2.lng) < threshold
}

// Helper to compare two arrays of waypoints
const areWaypointsEqual = (wp1: L.LatLng[], wp2: L.LatLng[]) => {
    if (!wp1 || !wp2 || wp1.length !== wp2.length) return false

    for (let i = 0; i < wp1.length; i++) {
        if (!arePositionsEqual(wp1[i], wp2[i])) return false
    }

    return true
}

// Dynamic import của Leaflet Routing Machine để tránh lỗi SSR
const RoutingControl = dynamic(
    () => import('leaflet-routing-machine').then(() => RoutingMachineComponent),
    { ssr: false }
)

interface RoutingMachineProps {
    pickup: [number, number]
    destination?: [number, number]
    vehicleLocation?: { latitude: number; longitude: number; heading: number | null }
}

// Component routing with stability improvements
const RoutingMachineComponent = memo(({
    pickup,
    destination,
    vehicleLocation
}: RoutingMachineProps) => {
    const map = useMap()
    const routingControlRef = useRef<L.Routing.Control | null>(null)

    const previousVehiclePositionRef = useRef<L.LatLng | null>(null)
    const routingInitializedRef = useRef<boolean>(false)
    const lastUpdateTimeRef = useRef<number>(0)
    const pendingUpdateRef = useRef<NodeJS.Timeout | null>(null)
    const vehicleDataRef = useRef(vehicleLocation)
    const pickupRef = useRef(pickup)
    const destinationRef = useRef(destination)

    // Update refs when props change
    useEffect(() => {
        vehicleDataRef.current = vehicleLocation
        pickupRef.current = pickup
        destinationRef.current = destination
    }, [vehicleLocation, pickup, destination])

    const hasVehicleMovedSignificantly = (newPos: L.LatLng) => {
        const prev = previousVehiclePositionRef.current
        if (!prev) return true
        return !arePositionsEqual(prev, newPos, 0.0001)
    }

    // Create waypoints with useMemo to prevent unnecessary recalculations
    const waypoints = useMemo(() => {
        const points: L.LatLng[] = []

        // Add vehicle position if it exists
        if (vehicleLocation) {
            const vehiclePoint = L.latLng(vehicleLocation.latitude, vehicleLocation.longitude)
            points.push(vehiclePoint)
        }

        // Add destination if it exists, otherwise use pickup
        if (destination) {
            points.push(L.latLng(destination[0], destination[1]))
        } else {
            // If no destination, route to pickup
            points.push(L.latLng(pickup[0], pickup[1]))
        }

        return points
    }, [pickup, destination, vehicleLocation?.latitude, vehicleLocation?.longitude])

    // Debounced function to update waypoints
    const updateRouteWaypoints = useCallback((newWaypoints: L.LatLng[]) => {
        // Clear any pending update
        if (pendingUpdateRef.current) {
            clearTimeout(pendingUpdateRef.current);
        }

        // Set a new timeout to update route
        pendingUpdateRef.current = setTimeout(() => {
            if (!routingControlRef.current) return;

            // Get current waypoints
            const currentWaypoints = routingControlRef.current.getWaypoints();

            // Only update if we have the same number of waypoints
            if (currentWaypoints.length === newWaypoints.length) {
                // Only update the vehicle position waypoint (first one)
                const updatedWaypoints = currentWaypoints.map((wp, index) => {
                    if (index === 0) {
                        return L.Routing.waypoint(newWaypoints[0]);
                    }
                    return wp;
                });

                routingControlRef.current.setWaypoints(updatedWaypoints);
            } else {
                // Fallback if waypoints structure changed
                routingControlRef.current.setWaypoints(newWaypoints.map(wp => L.Routing.waypoint(wp)));
            }

            pendingUpdateRef.current = null;
        }, 300); // 300ms debounce delay
    }, []);

    // Initial setup of routing control only once
    useEffect(() => {
        if (!map) return

        // Create new routing control if none exists yet
        const initialWaypoints = waypoints.map(wp => L.Routing.waypoint(wp))

        const routingControl = L.Routing.control({
            waypoints: initialWaypoints,
            lineOptions: {
                styles: [{ color: '#6366F1', weight: 4 }],
                extendToWaypoints: true,
                missingRouteTolerance: 0,
            },
            show: false,
            addWaypoints: false,
            routeWhileDragging: false,
            fitSelectedRoutes: false,
            showAlternatives: false,
            useZoomParameter: false,
        })

        // Hide the default markers after the control is created
        routingControl.on('routesfound', () => {
            const markerElements = document.querySelectorAll('.leaflet-marker-icon.leaflet-routing-icon');
            markerElements.forEach((marker) => {
                if (marker instanceof HTMLElement) {
                    marker.style.display = 'none';
                }
            });
        });

        routingControl.addTo(map)
        routingControlRef.current = routingControl
        routingInitializedRef.current = true

        // For initial vehicle position
        if (vehicleLocation) {
            previousVehiclePositionRef.current = L.latLng(vehicleLocation.latitude, vehicleLocation.longitude)
        }

        return () => {
            // Clear any pending updates
            if (pendingUpdateRef.current) {
                clearTimeout(pendingUpdateRef.current);
                pendingUpdateRef.current = null;
            }

            if (routingControlRef.current) {
                map.removeControl(routingControlRef.current)
                routingControlRef.current = null
                routingInitializedRef.current = false
            }
        }
        // Only run this effect once on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map])

    // Separate effect for handling vehicle position updates
    useEffect(() => {
        if (!map || !routingControlRef.current || !vehicleLocation || !routingInitializedRef.current) return

        const now = Date.now();
        const throttleTime = 500; // ms

        // Skip updates if we're still within throttle time
        if (now - lastUpdateTimeRef.current < throttleTime) {
            return;
        }

        const vehiclePos = L.latLng(vehicleLocation.latitude, vehicleLocation.longitude)

        // Only update if vehicle moved significantly
        if (hasVehicleMovedSignificantly(vehiclePos)) {
            lastUpdateTimeRef.current = now;
            previousVehiclePositionRef.current = vehiclePos;

            // Get current waypoints and update only the vehicle position (first waypoint)
            if (routingControlRef.current) {
                const currentWaypoints = routingControlRef.current.getWaypoints();

                if (currentWaypoints.length >= 2) {
                    // Create updated waypoints array with just the vehicle and destination
                    const updatedWaypoints = [
                        L.Routing.waypoint(vehiclePos),
                        // Keep the destination waypoint
                        currentWaypoints[currentWaypoints.length - 1]
                    ];

                    routingControlRef.current.setWaypoints(updatedWaypoints);
                }
            }
        }
    }, [vehicleLocation?.latitude, vehicleLocation?.longitude, map])

    return null
})

RoutingMachineComponent.displayName = 'RoutingMachineComponent'

// VehicleMarker component to properly handle updates
const VehicleMarker = memo(({
    position,
    heading
}: {
    position: [number, number];
    heading: number | null
}) => {
    const markerRef = useRef<L.Marker>(null)

    useEffect(() => {
        if (markerRef.current) {
            markerRef.current.setLatLng(position)
            markerRef.current.setIcon(createVehicleIcon(heading || 0))
        }
    }, [position, heading])

    return (
        <Marker
            position={position}
            ref={markerRef}
            icon={createVehicleIcon(heading || 0)}
        >
            <Popup>🚕 Vị trí xe hiện tại</Popup>
        </Marker>
    )
})

VehicleMarker.displayName = 'VehicleMarker'

// Map container component with fixed bounds calculation
const MapBoundsController = memo(({
    children,
    pickupLocation,
    destinationLocation,
    vehicleLocation
}: {
    children: React.ReactNode,
    pickupLocation: [number, number],
    destinationLocation?: [number, number],
    vehicleLocation?: { latitude: number; longitude: number; heading: number | null }
}) => {
    const map = useMap()
    const boundsInitializedRef = useRef(false)
    const previousBoundsRef = useRef<L.LatLngBounds | null>(null)
    const lastUpdateTimeRef = useRef(0)

    // Calculate fixed bounds based on all points
    useEffect(() => {
        if (!map) return

        // Throttle updates to prevent excessive re-renders
        const now = Date.now()
        if (now - lastUpdateTimeRef.current < 2000 && boundsInitializedRef.current) {
            return
        }
        lastUpdateTimeRef.current = now

        // Only set bounds once on initial load or when a significant point changes
        if (!boundsInitializedRef.current) {
            // Initial setup of bounds
            const points = [L.latLng(pickupLocation[0], pickupLocation[1])]

            if (destinationLocation) {
                points.push(L.latLng(destinationLocation[0], destinationLocation[1]))
            }

            if (vehicleLocation) {
                points.push(L.latLng(vehicleLocation.latitude, vehicleLocation.longitude))
            }

            if (points.length > 1) {
                const bounds = L.latLngBounds(points)

                // Add extra padding to ensure all markers are visible
                map.fitBounds(bounds, {
                    padding: [100, 100],
                    maxZoom: 15 // Limit zoom level
                })

                previousBoundsRef.current = bounds
                boundsInitializedRef.current = true
            } else if (points.length === 1) {
                map.setView(points[0], 15)
                boundsInitializedRef.current = true
            }
        } else if (vehicleLocation && previousBoundsRef.current) {
            // For vehicle updates, only adjust bounds if vehicle moves outside current view
            const currentVehicleLatLng = L.latLng(vehicleLocation.latitude, vehicleLocation.longitude)

            // Check if vehicle is still within current bounds with padding
            const currentBounds = map.getBounds()
            const padding = 0.2; // 20% padding

            // Calculate padded bounds
            const paddedBounds = L.latLngBounds(
                currentBounds.getSouthWest(),
                currentBounds.getNorthEast()
            )

            // Shrink bounds to create padding effect
            const latPadding = (currentBounds.getNorth() - currentBounds.getSouth()) * padding;
            const lngPadding = (currentBounds.getEast() - currentBounds.getWest()) * padding;

            paddedBounds.extend([
                currentBounds.getSouth() + latPadding,
                currentBounds.getWest() + lngPadding
            ]);
            paddedBounds.extend([
                currentBounds.getNorth() - latPadding,
                currentBounds.getEast() - lngPadding
            ]);

            // Only adjust view if vehicle is outside padded bounds
            if (!paddedBounds.contains(currentVehicleLatLng)) {
                // Smoothly pan to include vehicle
                map.panTo(currentVehicleLatLng, {
                    animate: true,
                    duration: 0.5
                });
            }
        }
    }, [
        map,
        pickupLocation,
        destinationLocation,
        vehicleLocation?.latitude,
        vehicleLocation?.longitude
    ])

    return <>{children}</>
})

MapBoundsController.displayName = 'MapBoundsController'

interface HourRealTimeTripMapProps {
    pickupLocation: [number, number];
    destinationLocation?: [number, number];
    vehicleId: string;
}

const HourRealTimeTripMap = memo(({ pickupLocation, destinationLocation, vehicleId }: HourRealTimeTripMapProps) => {
    const mapRef = useRef<L.Map | null>(null)
    const { data: vehicleLocation, isLoading } = useTrackingSocket(vehicleId)
    const [routingControlMounted, setRoutingControlMounted] = useState(false)

    // Memoize the vehicle marker to prevent re-renders
    const vehicleMarkerComponent = useMemo(() => {
        if (!vehicleLocation) return null

        return (
            <VehicleMarker
                position={[vehicleLocation.latitude, vehicleLocation.longitude]}
                heading={vehicleLocation.heading}
            />
        )
    }, [vehicleLocation?.latitude, vehicleLocation?.longitude, vehicleLocation?.heading])

    // Calculate the initial center based on vehicle location or fallback to pickup location
    const initialCenter = useMemo(() => {
        if (vehicleLocation) {
            return [vehicleLocation.latitude, vehicleLocation.longitude] as [number, number]
        }
        return pickupLocation
    }, [vehicleLocation, pickupLocation])

    return (
        <div className="h-96 w-full rounded-lg shadow-lg">
            <DynamicMapContainer
                center={initialCenter}
                zoom={15}
                className="h-full w-full"
                ref={(map) => {
                    if (map) {
                        mapRef.current = map
                    }
                }}
                zoomControl={true}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Only show vehicle marker */}
                {vehicleMarkerComponent}

                {/* Auto-center on vehicle when it updates */}
                {vehicleLocation && (
                    <VehiclePositionUpdater
                        position={[vehicleLocation.latitude, vehicleLocation.longitude]}
                    />
                )}
            </DynamicMapContainer>
        </div>
    )
})

// Helper component to auto-center map on vehicle position updates
const VehiclePositionUpdater = ({ position }: { position: [number, number] }) => {
    const map = useMap()
    const lastPositionRef = useRef<[number, number] | null>(null)

    useEffect(() => {
        if (!map || !position) return

        // Only recenter if position actually changed
        if (
            !lastPositionRef.current ||
            position[0] !== lastPositionRef.current[0] ||
            position[1] !== lastPositionRef.current[1]
        ) {
            map.setView(position, map.getZoom())
            lastPositionRef.current = position
        }
    }, [position, map])

    return null
}

VehiclePositionUpdater.displayName = 'VehiclePositionUpdater'

HourRealTimeTripMap.displayName = 'HourRealTimeTripMap'

export default HourRealTimeTripMap
