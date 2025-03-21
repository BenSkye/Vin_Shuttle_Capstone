'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder';
import './map.css';
import { routeService, RouteResponse } from '../../../../service/mapScenic';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';


interface CreateRouteProps {
    onRouteSelect?: (route: RouteResponse) => void;
    selectedRoute?: RouteResponse | null;
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

// Thiết lập icon mặc định cho Leaflet
const DefaultIcon = L.icon({
    iconUrl: icon.src,
    iconRetinaUrl: iconRetina.src,
    shadowUrl: iconShadow.src,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function SavedRouteDisplay({ coordinates }: { coordinates: L.LatLng[] }) {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        const polyline = L.polyline(coordinates, {
            color: '#3498db',
            weight: 6,
            opacity: 0.9
        }).addTo(map);

        map.fitBounds(polyline.getBounds());

        return () => {
            if (polyline) {
                map.removeLayer(polyline);
            }
        };
    }, [map, coordinates]);

    return null;
}

const renderStatusBadge = (status: 'draft' | 'active' | 'inactive') => {
    const statusConfig = {
        draft: { color: 'bg-gray-200 text-gray-800', text: 'Bản nháp' },
        active: { color: 'bg-green-200 text-green-800', text: 'Đang hoạt động' },
        inactive: { color: 'bg-red-200 text-red-800', text: 'Ngừng hoạt động' }
    };
    const config = statusConfig[status];
    return (
        <span className={`px-2 py-1 rounded-full text-sm ${config.color}`}>
            {config.text}
        </span>
    );
};

export default function CreateRoute({ onRouteSelect, selectedRoute: propSelectedRoute }: CreateRouteProps) {
    const [mapCenter] = useState<L.LatLngTuple>([10.840405, 106.843424]);
    const [savedRoutes, setSavedRoutes] = useState<RouteResponse[]>([]);
    const [selectedRoute, setSelectedRoute] = useState<RouteResponse | null>(null);
    const [localSelectedRoute, setLocalSelectedRoute] = useState<RouteResponse | null>(null);
    const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

    // Load saved routes from API
    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                const routes = await routeService.getAllRoutes();
                setSavedRoutes(routes);
            } catch (error) {
                console.error('Failed to fetch routes:', error);
            }
        };
        fetchRoutes();
    }, []);

    // Handle route selection
    const selectRoute = useCallback((route: RouteResponse) => {
        console.log('Selected route data:', route);

        // Update selected route ID for highlighting
        setSelectedRouteId(route._id);

        // Update local state
        setLocalSelectedRoute(route);
        setSelectedRoute(route);

        // Notify parent component if callback exists
        if (onRouteSelect) {
            onRouteSelect(route);
        }
    }, [onRouteSelect]);

    // Animation effect when route is selected
    const getRouteItemClasses = (routeId: string) => {
        const baseClasses = "p-3 rounded-lg cursor-pointer transition-all duration-300 border-2";

        if (selectedRouteId === routeId) {
            return `${baseClasses} bg-blue-50 border-blue-500 transform scale-[1.02] shadow-md`;
        }

        return `${baseClasses} bg-gray-50 hover:bg-gray-100 border-transparent`;
    };

    return (
        <div className="h-screen flex">
            {/* Sidebar for route list */}
            <div className="w-80 bg-white shadow-lg p-4 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-black">
                        {selectedRoute ? 'Chi tiết lộ trình' : 'Danh sách lộ trình'}
                    </h2>
                </div>

                <div className="space-y-2">
                    {!selectedRoute ? (
                        // Danh sách routes với hiệu ứng chọn
                        savedRoutes.map((route, index) => (
                            <div
                                key={route._id || index}
                                className={getRouteItemClasses(route._id)}
                                onClick={() => selectRoute(route)}
                            >
                                <div className="font-medium text-black">{route.name}</div>
                                <div className="text-sm text-gray-600">
                                    {new Date(route.createdAt).toLocaleDateString()}
                                </div>
                                <div className="mt-1">
                                    {renderStatusBadge(route.status)}
                                </div>
                            </div>
                        ))
                    ) : (
                        // Chi tiết route đã chọn
                        <div className="space-y-4">
                            <button
                                onClick={() => {
                                    setSelectedRoute(null);
                                    setSelectedRouteId(null);
                                }}
                                className="mb-4 text-blue-500 hover:text-blue-700 flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                </svg>
                                Quay lại danh sách
                            </button>
                            <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-blue-500">
                                <h3 className="text-xl font-bold text-black mb-2">{selectedRoute.name}</h3>
                                <p className="text-gray-600 mb-4">{selectedRoute.description || 'Không có mô tả'}</p>

                                <div className="mb-4">
                                    <h4 className="font-medium text-gray-700 mb-2">Các điểm dừng:</h4>
                                    <div className="space-y-2">
                                        {selectedRoute.waypoints.map((waypoint, index) => (
                                            <div
                                                key={waypoint.id}
                                                className="flex items-center gap-2 p-2 rounded-md bg-gray-50"
                                                style={{ borderLeft: `4px solid ${COLORS[index % COLORS.length]}` }}
                                            >
                                                <span className="font-medium text-gray-700">
                                                    {index + 1}.
                                                </span>
                                                <span className="text-gray-600">{waypoint.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                        <span>{selectedRoute.waypoints.length} điểm dừng</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                        </svg>
                                        <span>Thời gian dự kiến: {selectedRoute.estimatedDuration} phút</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                        <span>Khoảng cách dự kiến: {selectedRoute.totalDistance} km</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <span className="font-medium">Trạng thái:</span>
                                        {renderStatusBadge(selectedRoute.status)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {savedRoutes.length === 0 && (
                        <p className="text-gray-500 text-center">
                            Chưa có lộ trình nào được lưu
                        </p>
                    )}
                </div>
            </div>

            {/* Map display */}
            <div className="flex-grow">
                <MapContainer
                    center={mapCenter}
                    zoom={15.5}
                    style={{ height: '100%', width: '100%' }}
                    maxBounds={[
                        [10.830000, 106.830000], // Tọa độ góc dưới bên trái
                        [10.850000, 106.860000]  // Tọa độ góc trên bên phải
                    ]}
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
                            <SavedRouteDisplay
                                coordinates={selectedRoute.scenicRouteCoordinates.map(coord =>
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
                    )}
                </MapContainer>
            </div>
        </div>
    );
}