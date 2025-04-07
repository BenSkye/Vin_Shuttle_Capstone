'use client'

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import L from 'leaflet'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import 'leaflet/dist/leaflet.css'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { Marker, Popup, TileLayer, useMap } from 'react-leaflet'

import { imgAccess } from '@/constants/imgAccess'
import useTrackingSocket from '@/hooks/useTrackingSocket'

import { RouteResponse, routeService } from '@/service/mapScenic'

// Dynamic imports để tránh lỗi SSR
const DynamicMapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), {
  ssr: false,
})

// Colors for waypoint markers
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

// Custom waypoint marker
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

// Component to display saved route
function SavedRouteDisplay({ coordinates }: { coordinates: L.LatLng[] }) {
  const map = useMap()

  useEffect(() => {
    if (!map || coordinates.length < 2) return

    const polyline = L.polyline(coordinates, {
      color: '#3498db',
      weight: 6,
      opacity: 0.9,
    }).addTo(map)

    map.fitBounds(polyline.getBounds())

    return () => {
      if (polyline) {
        map.removeLayer(polyline)
      }
    }
  }, [map, coordinates])

  return null
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
const RoutingMachineComponent = memo(
  ({ pickup, destination, vehicleLocation }: RoutingMachineProps) => {
    const map = useMap()
    const routingControlRef = useRef<L.Routing.Control | null>(null)
    const previousWaypointsRef = useRef<L.LatLng[] | null>(null)
    const routingInitializedRef = useRef<boolean>(false)
    const lastUpdateTimeRef = useRef<number>(0)
    const pendingUpdateRef = useRef<NodeJS.Timeout | null>(null)

    // Create waypoints with useMemo to prevent unnecessary recalculations
    const waypoints = useMemo(() => {
      const points: L.LatLng[] = []

      // Add vehicle position if it exists
      if (vehicleLocation) {
        const vehiclePoint = L.latLng(vehicleLocation.latitude, vehicleLocation.longitude)
        points.push(vehiclePoint)
      }

      // Always add pickup point
      points.push(L.latLng(pickup[0], pickup[1]))

      // Add destination if it exists
      if (destination) {
        points.push(L.latLng(destination[0], destination[1]))
      }

      return points
    }, [pickup, destination, vehicleLocation?.latitude, vehicleLocation?.longitude])

    // Debounced function to update waypoints
    const updateRouteWaypoints = useCallback((newWaypoints: L.LatLng[]) => {
      // Clear any pending update
      if (pendingUpdateRef.current) {
        clearTimeout(pendingUpdateRef.current)
      }

      // Set a new timeout to update route
      pendingUpdateRef.current = setTimeout(() => {
        if (!routingControlRef.current) return

        // Get current waypoints
        const currentWaypoints = routingControlRef.current.getWaypoints()

        // Only update if we have the same number of waypoints
        if (currentWaypoints.length === newWaypoints.length) {
          // Only update the vehicle position waypoint (first one)
          const updatedWaypoints = currentWaypoints.map((wp, index) => {
            if (index === 0) {
              return L.Routing.waypoint(newWaypoints[0])
            }
            return wp
          })

          routingControlRef.current.setWaypoints(updatedWaypoints)
        } else {
          // Fallback if waypoints structure changed
          routingControlRef.current.setWaypoints(newWaypoints.map((wp) => L.Routing.waypoint(wp)))
        }

        pendingUpdateRef.current = null
      }, 300) // 300ms debounce delay
    }, [])

    // Setup or update routing control
    useEffect(() => {
      if (!map || waypoints.length < 2) return

      // Throttle updates to prevent excessive re-routing
      const now = Date.now()
      const throttleTime = 500 // ms

      if (now - lastUpdateTimeRef.current < throttleTime && routingInitializedRef.current) {
        // If we need to update but are being throttled, schedule an update
        if (routingControlRef.current && vehicleLocation) {
          updateRouteWaypoints(waypoints)
        }
        return
      }

      lastUpdateTimeRef.current = now

      // If we already have a routing control, update its waypoints
      if (routingControlRef.current && routingInitializedRef.current) {
        // Only update if vehicle position changed (first waypoint)
        if (waypoints.length > 0 && vehicleLocation) {
          updateRouteWaypoints(waypoints)
        }
        return
      }

      // Create new routing control if none exists yet
      const routingControl = L.Routing.control({
        waypoints: waypoints.map((wp) => L.Routing.waypoint(wp)),
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
        const markerElements = document.querySelectorAll(
          '.leaflet-marker-icon.leaflet-routing-icon'
        )
        markerElements.forEach((marker) => {
          if (marker instanceof HTMLElement) {
            marker.style.display = 'none'
          }
        })
      })

      routingControl.addTo(map)
      routingControlRef.current = routingControl
      routingInitializedRef.current = true

      return () => {
        // Clear any pending updates
        if (pendingUpdateRef.current) {
          clearTimeout(pendingUpdateRef.current)
          pendingUpdateRef.current = null
        }

        if (routingControlRef.current) {
          map.removeControl(routingControlRef.current)
          routingControlRef.current = null
          routingInitializedRef.current = false
        }
      }
    }, [map, waypoints, vehicleLocation, updateRouteWaypoints])

    return null
  }
)

RoutingMachineComponent.displayName = 'RoutingMachineComponent'

// VehicleMarker component to properly handle updates
const VehicleMarker = memo(
  ({ position, heading }: { position: [number, number]; heading: number | null }) => {
    const markerRef = useRef<L.Marker>(null)

    useEffect(() => {
      if (markerRef.current) {
        markerRef.current.setLatLng(position)
        markerRef.current.setIcon(createVehicleIcon(heading || 0))
      }
    }, [position, heading])

    return (
      <Marker position={position} ref={markerRef} icon={createVehicleIcon(heading || 0)}>
        <Popup>🚕 Vị trí xe hiện tại</Popup>
      </Marker>
    )
  }
)

VehicleMarker.displayName = 'VehicleMarker'

// Map container component with fixed bounds calculation
const MapBoundsController = memo(
  ({
    children,
    pickupLocation,
    destinationLocation,
    vehicleLocation,
  }: {
    children: React.ReactNode
    pickupLocation: [number, number]
    destinationLocation?: [number, number]
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
            maxZoom: 15, // Limit zoom level
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
        const padding = 0.2 // 20% padding

        // Calculate padded bounds
        const paddedBounds = L.latLngBounds(
          currentBounds.getSouthWest(),
          currentBounds.getNorthEast()
        )

        // Shrink bounds to create padding effect
        const latPadding = (currentBounds.getNorth() - currentBounds.getSouth()) * padding
        const lngPadding = (currentBounds.getEast() - currentBounds.getWest()) * padding

        paddedBounds.extend([
          currentBounds.getSouth() + latPadding,
          currentBounds.getWest() + lngPadding,
        ])
        paddedBounds.extend([
          currentBounds.getNorth() - latPadding,
          currentBounds.getEast() - lngPadding,
        ])

        // Only adjust view if vehicle is outside padded bounds
        if (!paddedBounds.contains(currentVehicleLatLng)) {
          // Smoothly pan to include vehicle
          map.panTo(currentVehicleLatLng, {
            animate: true,
            duration: 0.5,
          })
        }
      }
    }, [
      map,
      pickupLocation,
      destinationLocation,
      vehicleLocation?.latitude,
      vehicleLocation?.longitude,
    ])

    return <>{children}</>
  }
)

MapBoundsController.displayName = 'MapBoundsController'

interface ScenicRealTimeTripMapProps {
  pickupLocation: [number, number]
  destinationLocation?: [number, number]
  vehicleId: string
  selectedRoute?: RouteResponse
  routeId?: string
}

const ScenicRealTimeTripMap = memo(
  ({
    pickupLocation,
    destinationLocation,
    vehicleId,
    selectedRoute: propSelectedRoute,
    routeId,
  }: ScenicRealTimeTripMapProps) => {
    const mapRef = useRef<L.Map | null>(null)
    const { data: vehicleLocation, isLoading } = useTrackingSocket(vehicleId)
    const [loadedRoute, setLoadedRoute] = useState<RouteResponse | null>(null)
    const [isLoadingRoute, setIsLoadingRoute] = useState(false)
    const [routeError, setRouteError] = useState<string | null>(null)

    // Determine the route to display (prop or fetched)
    const selectedRoute = useMemo(() => {
      return propSelectedRoute || loadedRoute
    }, [propSelectedRoute, loadedRoute])

    // Fetch route data if routeId is provided but no selectedRoute
    useEffect(() => {
      const fetchRouteData = async () => {
        if (!routeId || propSelectedRoute) return

        setIsLoadingRoute(true)
        setRouteError(null)

        try {
          const routeData = await routeService.getRouteById(routeId)
          setLoadedRoute(routeData)
        } catch (error) {
          console.error('Error fetching route data:', error)
          setRouteError('Không thể tải dữ liệu tuyến đường')
        } finally {
          setIsLoadingRoute(false)
        }
      }

      fetchRouteData()
    }, [routeId, propSelectedRoute])

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

    // Memoize route display to prevent unnecessary re-renders
    const routeDisplayComponent = useMemo(() => {
      if (!selectedRoute) return null

      return (
        <>
          <SavedRouteDisplay
            coordinates={selectedRoute.scenicRouteCoordinates.map((coord) =>
              L.latLng(coord.lat, coord.lng)
            )}
          />
          {selectedRoute.waypoints.map((waypoint, index) => (
            <Marker
              key={waypoint.id}
              position={L.latLng(waypoint.position.lat, waypoint.position.lng)}
              icon={createCustomIcon({ color: COLORS[index % COLORS.length] })}
            >
              <Popup>{waypoint.name}</Popup>
            </Marker>
          ))}
        </>
      )
    }, [selectedRoute])

    const initialCenter = useMemo(() => pickupLocation, [pickupLocation])

    if (isLoadingRoute) {
      return (
        <div className="flex h-96 w-full items-center justify-center rounded-lg bg-gray-100 shadow-lg">
          Đang tải thông tin tuyến đường...
        </div>
      )
    }

    if (routeError) {
      return (
        <div className="flex h-96 w-full items-center justify-center rounded-lg bg-red-50 text-red-500 shadow-lg">
          {routeError}
        </div>
      )
    }

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

          <MapBoundsController
            pickupLocation={pickupLocation}
            destinationLocation={destinationLocation}
            vehicleLocation={vehicleLocation}
          >
            {routeDisplayComponent}

            {/* Vehicle location */}
            {vehicleMarkerComponent}
          </MapBoundsController>
        </DynamicMapContainer>
      </div>
    )
  }
)

ScenicRealTimeTripMap.displayName = 'ScenicRealTimeTripMap'

export default ScenicRealTimeTripMap
