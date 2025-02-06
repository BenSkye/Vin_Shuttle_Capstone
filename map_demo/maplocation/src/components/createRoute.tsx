'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder';
import './map.css';
import { tripService, TripRequest, TripResponse } from '../services/tripService';

interface BusStop {
    id: number;
    position: L.LatLng;
    name: string;
    color: string;
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
];

const createCustomIcon = ({ color }: { color: string }) => {
    return L.divIcon({
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" class="size-6">
            <path fill-rule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742Z" clip-rule="evenodd" />
        </svg>`,
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
    });
};

function RoutingMachine({ stops, onRouteFound }: {
    stops: BusStop[];
    onRouteFound: (coordinates: L.LatLng[], estimatedDuration: number, totalDistance: number) => void;
}) {
    const map = useMap();
    const routingControlRef = useRef<L.Routing.Control | null>(null);

    useEffect(() => {
        if (!map || stops.length < 2) return;

        if (routingControlRef.current) {
            map.removeControl(routingControlRef.current);
            routingControlRef.current = null;
        }

        const waypoints = stops.map(stop => stop.position);

        routingControlRef.current = L.Routing.control({
            waypoints: waypoints,
            routeWhileDragging: true,
            addWaypoints: false,
            fitSelectedRoutes: true,
            showAlternatives: false,
            show: false,
            createMarker: () => null,
            lineOptions: {
                styles: [{ color: '#3498db', weight: 6, opacity: 0.9 }],
                extendToWaypoints: true,
                missingRouteTolerance: 0
            }
        }).addTo(map);

        routingControlRef.current.on('routesfound', (e) => {
            const routes = e.routes;
            if (routes && routes.length > 0) {
                const coordinates = routes[0].coordinates;
                const estimatedDuration = routes[0].summary.totalTime;
                const totalDistance = routes[0].summary.totalDistance;
                onRouteFound(coordinates, estimatedDuration, totalDistance);
            }
        });

        return () => {
            if (routingControlRef.current && map) {
                map.removeControl(routingControlRef.current);
            }
        };
    }, [map, stops, onRouteFound]);

    return null;
}

function SavedRouteDisplay({ coordinates }: { coordinates: L.LatLng[] }) {
    const map = useMap();

    useEffect(() => {
        const polyline = L.polyline(coordinates, {
            color: '#3498db',
            weight: 6,
            opacity: 0.9
        }).addTo(map);

        map.fitBounds(polyline.getBounds());

        return () => {
            map.removeLayer(polyline);
        };
    }, [map, coordinates]);

    return null;
}

export default function CreateRoute() {
    const [stops, setStops] = useState<BusStop[]>([]);
    const [mapCenter] = useState<L.LatLngTuple>([10.842, 106.843]);
    const [routeCoordinates, setRouteCoordinates] = useState<L.LatLng[]>([]);
    const [savedRoutes, setSavedRoutes] = useState<TripResponse[]>([]);
    const [selectedRoute, setSelectedRoute] = useState<TripResponse | null>(null);
    const [isCreatingRoute, setIsCreatingRoute] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [estimatedDuration, setEstimatedDuration] = useState(0);
    const [totalDistance, setTotalDistance] = useState(0);

    useEffect(() => {
        // Load saved routes from API
        const fetchRoutes = async () => {
            try {
                const routes = await tripService.getAllTrips();
                setSavedRoutes(routes);
            } catch (error) {
                console.error('Failed to fetch routes:', error);
            }
        };
        fetchRoutes();
    }, []);

    const handleRouteFound = useCallback((coordinates: L.LatLng[], estimatedDuration: number, totalDistance: number) => {
        setRouteCoordinates(coordinates);
        setEstimatedDuration(estimatedDuration);
        setTotalDistance(totalDistance);
    }, []);

    const handleMapClick = useCallback((latlng: L.LatLng) => {
        setStops(prevStops => {
            const newStop: BusStop = {
                id: prevStops.length,
                position: latlng,
                name: `Điểm dừng ${prevStops.length + 1}`,
                color: COLORS[prevStops.length % COLORS.length]
            };
            return [...prevStops, newStop];
        });
    }, []);

    const removeStop = useCallback((stopId: number) => {
        setStops(prevStops => prevStops.filter(stop => stop.id !== stopId));
    }, []);

    const saveRoute = useCallback(async () => {
        if (routeCoordinates.length > 0 && stops.length >= 2) {
            try {
                setIsLoading(true);
                const tripData: TripRequest = {
                    name: `Lộ trình ${savedRoutes.length + 1}`,
                    description: `Lộ trình từ ${stops[0].name} đến ${stops[stops.length - 1].name}`,
                    route: {
                        waypoints: stops.map(stop => ({
                            id: stop.id,
                            name: stop.name,
                            position: {
                                lat: stop.position.lat,
                                lng: stop.position.lng
                            }
                        })),
                        routeCoordinates: routeCoordinates.map(coord => ({
                            lat: coord.lat,
                            lng: coord.lng
                        })),
                        estimatedDuration: estimatedDuration,
                        totalDistance: totalDistance
                    },
                };

                const newRoute = await tripService.createTrip(tripData);
                setSavedRoutes(prev => [...prev, newRoute]);
                setIsCreatingRoute(false);
                setSelectedRoute(newRoute);
                alert('Đã lưu lộ trình thành công!');
            } catch (error) {
                console.error('Failed to save route:', error);
                alert('Không thể lưu lộ trình. Vui lòng thử lại!');
            } finally {
                setIsLoading(false);
            }
        }
    }, [routeCoordinates, stops, savedRoutes]);

    const selectRoute = useCallback((route: TripResponse) => {
        setSelectedRoute(route);
        setIsCreatingRoute(false);
    }, []);

    return (
        <div className="h-screen flex">
            <div className="w-80 bg-white shadow-lg p-4 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">
                        {isCreatingRoute ? 'Tạo lộ trình mới' : 'Danh sách lộ trình'}
                    </h2>
                    <button
                        onClick={() => {
                            setIsCreatingRoute(!isCreatingRoute);
                            setSelectedRoute(null);
                            setStops([]);
                            setRouteCoordinates([]);
                        }}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        {isCreatingRoute ? 'Xem danh sách' : 'Tạo mới'}
                    </button>
                </div>

                {isCreatingRoute ? (
                    <>
                        {stops.map((stop) => (
                            <div
                                key={stop.id}
                                className="flex items-center justify-between p-3 mb-2 rounded-lg"
                                style={{ backgroundColor: `${stop.color}20` }}
                            >
                                <div>
                                    <div className="font-semibold" style={{ color: stop.color }}>
                                        {stop.name}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {stop.position.lat.toFixed(6)}, {stop.position.lng.toFixed(6)}
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeStop(stop.id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        {stops.length === 0 && (
                            <p className="text-gray-500 text-center">
                                Nhấp vào bản đồ để thêm điểm dừng
                            </p>
                        )}
                        {stops.length >= 2 && routeCoordinates.length > 0 && (
                            <button
                                onClick={saveRoute}
                                disabled={isLoading}
                                className={`w-full mt-4 bg-green-500 text-white py-2 px-4 rounded 
                                    ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'}`}
                            >
                                {isLoading ? 'Đang lưu...' : 'Lưu lộ trình'}
                            </button>
                        )}
                    </>
                ) : (
                    <div className="space-y-2">
                        {savedRoutes.map(route => (
                            <div
                                key={route.id}
                                className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedRoute?.id === route.id
                                    ? 'bg-blue-100 border-blue-500'
                                    : 'bg-gray-50 hover:bg-gray-100'
                                    }`}
                                onClick={() => selectRoute(route)}
                            >
                                <div className="font-medium">{route.name}</div>
                                <div className="text-sm text-gray-600">
                                    {new Date(route.createdAt).toLocaleDateString()}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {route.route.waypoints.length} điểm dừng
                                </div>
                            </div>
                        ))}
                        {savedRoutes.length === 0 && (
                            <p className="text-gray-500 text-center">
                                Chưa có lộ trình nào được lưu
                            </p>
                        )}
                    </div>
                )}
            </div>

            <div className="flex-grow">
                <MapContainer
                    center={mapCenter}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {isCreatingRoute ? (
                        <>
                            {stops.map((stop) => (
                                <Marker
                                    key={stop.id}
                                    position={stop.position}
                                    icon={createCustomIcon({ color: stop.color })}
                                >
                                    <Popup>{stop.name}</Popup>
                                </Marker>
                            ))}
                            {stops.length >= 2 && (
                                <RoutingMachine
                                    stops={stops}
                                    onRouteFound={handleRouteFound}
                                />
                            )}
                            <MapClickHandler onMapClick={handleMapClick} />
                        </>
                    ) : (
                        selectedRoute && (
                            <>
                                <SavedRouteDisplay
                                    coordinates={selectedRoute.route.routeCoordinates.map(coord =>
                                        L.latLng(coord.lat, coord.lng)
                                    )}
                                />
                                {selectedRoute.route.waypoints.map((waypoint, index) => (
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
                    )}
                </MapContainer>
            </div>
        </div>
    );
}

function MapClickHandler({ onMapClick }: { onMapClick: (latlng: L.LatLng) => void }) {
    useMapEvents({
        click: (e) => {
            onMapClick(e.latlng);
        },
    });
    return null;
}
