'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder';
import './map.css';

interface BusStop {
    id: number;
    position: L.LatLng;
    name: string;
    color: string;
}

interface SavedRoute {
    coordinates: L.LatLng[];
    stops: BusStop[];
}

interface SavedRouteWithId extends SavedRoute {
    id: string;
    name: string;
    createdAt: string;
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
    onRouteFound: (coordinates: L.LatLng[]) => void;
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
            show: false, // Ẩn bảng chỉ đường mặc định
            createMarker: () => null, // Không tạo marker mặc định
            lineOptions: {
                styles: [{ color: '#3498db', weight: 6, opacity: 0.9 }]
            }
        }).addTo(map);

        routingControlRef.current.on('routesfound', (e) => {
            const routes = e.routes;
            if (routes && routes.length > 0) {
                // Lấy tọa độ của route đầu tiên
                const coordinates = routes[0].coordinates;
                console.log('coordinates at routes', coordinates)
                onRouteFound(coordinates);
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
    const [savedRoute, setSavedRoute] = useState<SavedRoute | null>(null);
    const [savedRoutes, setSavedRoutes] = useState<SavedRouteWithId[]>([]);
    const [selectedRoute, setSelectedRoute] = useState<SavedRouteWithId | null>(null);
    const [isCreatingRoute, setIsCreatingRoute] = useState(true);

    useEffect(() => {
        const routes = localStorage.getItem('busRoutes');
        if (routes) {
            const parsedRoutes = JSON.parse(routes);
            // Convert coordinates back to LatLng objects
            const routesWithLatLng = parsedRoutes.map((route: any) => ({
                ...route,
                coordinates: route.coordinates.map((coord: any) => L.latLng(coord.lat, coord.lng))
            }));
            setSavedRoutes(routesWithLatLng);
        }
    }, []);

    const handleRouteFound = useCallback((coordinates: L.LatLng[]) => {
        setSavedRoute({
            coordinates,
            stops: [...stops]
        });
    }, [stops]);

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

    const saveRoute = useCallback(() => {
        if (savedRoute) {
            const newRoute: SavedRouteWithId = {
                id: Date.now().toString(),
                name: `Lộ trình ${savedRoutes.length + 1}`,
                createdAt: new Date().toISOString(),
                coordinates: savedRoute.coordinates,
                stops: savedRoute.stops
            };

            const updatedRoutes = [...savedRoutes, newRoute];
            setSavedRoutes(updatedRoutes);
            localStorage.setItem('busRoutes', JSON.stringify(updatedRoutes.map(route => ({
                ...route,
                coordinates: route.coordinates.map(coord => ({
                    lat: coord.lat,
                    lng: coord.lng
                }))
            }))));

            setIsCreatingRoute(false);
            setSelectedRoute(newRoute);
            alert('Đã lưu lộ trình thành công!');
        }
    }, [savedRoute, savedRoutes]);

    const selectRoute = useCallback((route: SavedRouteWithId) => {
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
                        {stops.length >= 2 && savedRoute && (
                            <button
                                onClick={saveRoute}
                                className="w-full mt-4 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                            >
                                Lưu lộ trình
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
                                    {route.stops.length} điểm dừng
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
                                <SavedRouteDisplay coordinates={selectedRoute.coordinates} />
                                {selectedRoute.stops.map((stop) => (
                                    <Marker
                                        key={stop.id}
                                        position={stop.position}
                                        icon={createCustomIcon({ color: stop.color })}
                                    >
                                        <Popup>{stop.name}</Popup>
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