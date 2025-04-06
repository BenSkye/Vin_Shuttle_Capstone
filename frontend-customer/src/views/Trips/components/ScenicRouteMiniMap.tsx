'use client'

import { useEffect, useRef, useState, useMemo, memo } from 'react'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import dynamic from 'next/dynamic'
import { Marker, Popup, TileLayer, useMap } from 'react-leaflet'

import { RouteResponse, routeService } from '@/service/mapScenic'

// Dynamic imports to avoid SSR issues
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

        map.fitBounds(polyline.getBounds(), {
            padding: [30, 30],
            maxZoom: 15
        })

        return () => {
            if (polyline) {
                map.removeLayer(polyline)
            }
        }
    }, [map, coordinates])

    return null
}

// Map bounds controller
const MapBoundsController = memo(({
    children,
    pickupLocation,
    route
}: {
    children: React.ReactNode,
    pickupLocation: [number, number],
    route?: RouteResponse
}) => {
    const map = useMap()
    const boundsInitializedRef = useRef(false)

    // Set bounds based on route and pickup location
    useEffect(() => {
        if (!map || boundsInitializedRef.current) return

        const points = [L.latLng(pickupLocation[0], pickupLocation[1])]

        // Add route waypoints if available
        if (route?.waypoints) {
            route.waypoints.forEach(waypoint => {
                points.push(L.latLng(waypoint.position.lat, waypoint.position.lng))
            })
        }

        if (points.length > 1) {
            const bounds = L.latLngBounds(points)
            map.fitBounds(bounds, {
                padding: [50, 50],
                maxZoom: 15
            })
        } else {
            map.setView(points[0], 14)
        }

        boundsInitializedRef.current = true
    }, [map, pickupLocation, route])

    return <>{children}</>
})

MapBoundsController.displayName = 'MapBoundsController'

interface ScenicRouteMiniMapProps {
    pickupLocation: [number, number];
    routeId?: string;
    selectedRoute?: RouteResponse;
    height?: string;
}

const ScenicRouteMiniMap = memo(({
    pickupLocation,
    routeId,
    selectedRoute: propSelectedRoute,
    height = "h-60"
}: ScenicRouteMiniMapProps) => {
    const mapRef = useRef<L.Map | null>(null)
    const [loadedRoute, setLoadedRoute] = useState<RouteResponse | null>(null)
    const [isLoadingRoute, setIsLoadingRoute] = useState(false)
    const [routeError, setRouteError] = useState<string | null>(null)

    // Determine the route to display (prop or fetched)
    const selectedRoute = useMemo(() => {
        return propSelectedRoute || loadedRoute;
    }, [propSelectedRoute, loadedRoute]);

    // Fetch route data if routeId is provided but no selectedRoute
    useEffect(() => {
        const fetchRouteData = async () => {
            if (!routeId || propSelectedRoute) return;

            setIsLoadingRoute(true);
            setRouteError(null);

            try {
                const routeData = await routeService.getRouteById(routeId);
                setLoadedRoute(routeData);
            } catch (error) {
                console.error('Error fetching route data:', error);
                setRouteError('Không thể tải dữ liệu tuyến đường');
            } finally {
                setIsLoadingRoute(false);
            }
        };

        fetchRouteData();
    }, [routeId, propSelectedRoute]);

    // Memoize route display to prevent unnecessary re-renders
    const routeDisplayComponent = useMemo(() => {
        if (!selectedRoute) return null;

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
        );
    }, [selectedRoute]);

    const initialCenter = useMemo(() => pickupLocation, [pickupLocation]);

    if (isLoadingRoute) {
        return <div className={`${height} w-full rounded-lg shadow-md flex items-center justify-center bg-gray-100`}>Đang tải tuyến đường...</div>;
    }

    if (routeError) {
        return <div className={`${height} w-full rounded-lg shadow-md flex items-center justify-center bg-red-50 text-red-500`}>{routeError}</div>;
    }

    return (
        <div className={`${height} w-full rounded-lg shadow-md overflow-hidden`}>
            <DynamicMapContainer
                center={initialCenter}
                zoom={14}
                className="h-full w-full"
                ref={(map) => {
                    if (map) {
                        mapRef.current = map;
                    }
                }}
                zoomControl={true}
                scrollWheelZoom={false}
                dragging={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapBoundsController
                    pickupLocation={pickupLocation}
                    route={selectedRoute}
                >
                    {/* Display pickup location marker */}
                    <Marker position={pickupLocation}>
                        <Popup>Điểm đón</Popup>
                    </Marker>

                    {/* Display the route if it exists */}
                    {routeDisplayComponent}
                </MapBoundsController>
            </DynamicMapContainer>
        </div>
    );
});

ScenicRouteMiniMap.displayName = 'ScenicRouteMiniMap';

export default ScenicRouteMiniMap; 