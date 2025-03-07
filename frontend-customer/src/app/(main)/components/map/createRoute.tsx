'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder';
import './map.css';
import { routeService, RouteRequest, RouteResponse } from '../../../../service/mapSenic';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';


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

function RoutingMachine({ stops, onRouteFound, savedRoute }: {
    stops: BusStop[];
    onRouteFound: (coordinates: L.LatLng[], estimatedDuration: number, totalDistance: number) => void;
    savedRoute?: {
        coordinates: L.LatLng[];
        estimatedDuration: number;
        totalDistance: number;
    };
}) {
    const map = useMap();
    const routingControlRef = useRef<L.Routing.Control | null>(null);

    useEffect(() => {
        if (!map || stops.length < 2) return;

        if (routingControlRef.current) {
            map.removeControl(routingControlRef.current);
            routingControlRef.current = null;
        }

        // Nếu có savedRoute, sử dụng coordinates đã lưu
        if (savedRoute) {
            const polyline = L.polyline(savedRoute.coordinates, {
                color: '#3498db',
                weight: 6,
                opacity: 0.9
            }).addTo(map);

            map.fitBounds(polyline.getBounds());

            // Sử dụng thông tin đã lưu
            onRouteFound(
                savedRoute.coordinates,
                savedRoute.estimatedDuration,
                savedRoute.totalDistance
            );

            return () => {
                polyline.removeFrom(map);
            };
        }

        // Nếu không có savedRoute, tạo route mới
        const waypoints = stops.map(stop => stop.position);

        routingControlRef.current = L.Routing.control({
            waypoints: waypoints,
            routeWhileDragging: true,
            addWaypoints: true,
            fitSelectedRoutes: false,
            showAlternatives: false,
            show: false,
            lineOptions: {
                styles: [{ color: '#3498db', weight: 2, opacity: 0.9 }],
                extendToWaypoints: true,
                missingRouteTolerance: 5
            }
        }).addTo(map);


        routingControlRef.current.on('routesfound', (e) => {
            const routes = e.routes;
            if (routes && routes.length > 0) {
                const coordinates = routes[0].coordinates;
                const estimatedDuration = Number((routes[0].summary.totalTime / 60).toFixed(1));
                const totalDistance = Number((routes[0].summary.totalDistance / 1000).toFixed(1));
                onRouteFound(coordinates, estimatedDuration, totalDistance);
            }
        });

        return () => {
            if (routingControlRef.current && map) {
                map.removeControl(routingControlRef.current);
            }
        };
    }, [map, stops, onRouteFound, savedRoute]);

    return null;
}

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

const getStreetName = async (latlng: L.LatLng) => {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json`);
    const data = await response.json();

    // Tách tên đường dựa trên dấu phẩy và lấy 2 phần tử đầu
    const streetParts = data.display_name ? data.display_name.split(',') : [];
    const streetName = streetParts.slice(0, 2).join(', '); // Kết hợp lại thành chuỗi

    return streetName || 'Tên đường không tìm thấy';
};

// Định nghĩa type cho error
type SaveRouteError = {
    message: string;
    status?: number;
};

// Validation helper - đưa ra ngoài component
const isValidRoute = (routeCoordinates: L.LatLng[], stops: BusStop[]) => {
    return routeCoordinates.length > 0 && stops.length >= 2;
};

const STATUS_OPTIONS = [
    { value: 'draft', label: 'Bản nháp' },
    { value: 'active', label: 'Đang hoạt động' },
    { value: 'inactive', label: 'Ngừng hoạt động' }
];

export default function CreateRoute() {
    const [stops, setStops] = useState<BusStop[]>([]);
    const [mapCenter] = useState<L.LatLngTuple>([10.840405, 106.843424]);
    const [routeCoordinates, setRouteCoordinates] = useState<L.LatLng[]>([]);
    const [savedRoutes, setSavedRoutes] = useState<RouteResponse[]>([]);
    const [selectedRoute, setSelectedRoute] = useState<RouteResponse | null>(null);
    const [isCreatingRoute, setIsCreatingRoute] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [estimatedDuration, setEstimatedDuration] = useState(0);
    const [totalDistance, setTotalDistance] = useState(0);
    const [routeName, setRouteName] = useState('');
    const [routeDescription, setRouteDescription] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [routeStatus, setRouteStatus] = useState<'draft' | 'active' | 'inactive'>('draft');

    useEffect(() => {
        // Load saved routes from API
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

    const handleRouteFound = useCallback((coordinates: L.LatLng[], estimatedDuration: number, totalDistance: number) => {
        setRouteCoordinates(coordinates);
        setEstimatedDuration(estimatedDuration);
        setTotalDistance(totalDistance);
    }, []);

    useEffect(() => {
        console.log('routeCoordinates', routeCoordinates)
    }, [routeCoordinates])


    useEffect(() => {
        console.log('estimatedDuration', estimatedDuration)
    }, [estimatedDuration])

    useEffect(() => {
        console.log('totalDistance', totalDistance)
    }, [totalDistance])


    const handleMapClick = useCallback(async (latlng: L.LatLng) => {
        const streetName = await getStreetName(latlng);
        setStops(prevStops => {
            const newStop: BusStop = {
                id: prevStops.length,
                position: latlng,
                name: streetName,
                color: COLORS[prevStops.length % COLORS.length]
            };
            return [...prevStops, newStop];
        });
    }, []);

    const removeStop = useCallback((stopId: number) => {
        setStops(prevStops => prevStops.filter(stop => stop.id !== stopId));
    }, []);

    const handleEditRoute = useCallback((route: RouteResponse) => {
        setIsEditing(true);
        setSelectedRoute(route);
        setIsCreatingRoute(true);
        setRouteName(route.name);
        setRouteDescription(route.description);
        setRouteStatus(route.status);

        const formattedStops = route.waypoints.map((waypoint, index) => ({
            id: waypoint.id,
            position: L.latLng(waypoint.position.lat, waypoint.position.lng),
            name: waypoint.name,
            color: COLORS[index % COLORS.length]
        }));
        setStops(formattedStops);
        setRouteCoordinates(route.scenicRouteCoordinates.map(coord => L.latLng(coord.lat, coord.lng)));
    }, []);


    const prepareRouteData = useCallback((): RouteRequest => {
        return {
            name: routeName,
            description: routeDescription,
            waypoints: stops.map(stop => ({
                id: stop.id,
                name: stop.name,
                position: {
                    lat: stop.position.lat,
                    lng: stop.position.lng
                }
            })),
            scenicRouteCoordinates: routeCoordinates.map(coord => ({
                lat: coord.lat,
                lng: coord.lng
            })),
            estimatedDuration: estimatedDuration,
            totalDistance: totalDistance,
            status: routeStatus
        };
    }, [routeName, routeDescription, stops, routeCoordinates, estimatedDuration, totalDistance, routeStatus]);


    const handleRouteSave = useCallback(async (routeData: RouteRequest) => {
        try {
            if (isEditing && selectedRoute?._id) {
                const updatedRoute = await routeService.editRoute(selectedRoute._id, routeData);
                if (updatedRoute) {
                    setSavedRoutes(prev => prev.map(route =>
                        route._id === updatedRoute._id ? updatedRoute : route
                    ));
                    setSelectedRoute(updatedRoute);
                }
            } else {
                const newRoute = await routeService.createRoute(routeData);
                if (newRoute) {
                    setSavedRoutes(prev => [...prev, newRoute]);
                    setSelectedRoute(newRoute);
                }
            }
        } catch (error) {
            console.error('Failed to save route:', error);
            throw error;
        }
    }, [isEditing, selectedRoute, setSavedRoutes, setSelectedRoute]);

    // Success handler
    const handleSaveSuccess = useCallback(() => {
        setIsCreatingRoute(false);
        setIsEditing(false);
        alert(isEditing ? 'Đã cập nhật lộ trình thành công!' : 'Đã lưu lộ trình thành công!');
    }, [isEditing, setIsCreatingRoute, setIsEditing]);

    // Error handler
    const handleSaveError = useCallback((error: SaveRouteError) => {
        console.error('Failed to save route:', error);
        alert('Không thể lưu lộ trình. Vui lòng thử lại!');
    }, []);

    // Main save function
    const saveRoute = useCallback(async () => {
        if (!isValidRoute(routeCoordinates, stops)) return;

        try {
            setIsLoading(true);
            const routeData = prepareRouteData();
            await handleRouteSave(routeData);
            handleSaveSuccess();
        } catch (error) {
            handleSaveError(error as SaveRouteError);
        } finally {
            setIsLoading(false);
        }
    }, [
        routeCoordinates,
        stops,
        setIsLoading,
        prepareRouteData,
        handleRouteSave,
        handleSaveSuccess,
        handleSaveError
    ]);

    // Reset form helper
    // const resetForm = useCallback(() => {
    //     setIsCreatingRoute(false);
    //     setSelectedRoute(null);
    //     setStops([]);
    //     setRouteCoordinates([]);
    //     setIsEditing(false);
    //     setRouteName('');
    //     setRouteDescription('');
    // }, []);

    const selectRoute = useCallback((route: RouteResponse) => {
        setSelectedRoute(route);
        setIsCreatingRoute(false);
    }, []);

    useEffect(() => {
        if (selectedRoute) {
            setRouteName(selectedRoute.name);
            setRouteDescription(selectedRoute.description);
            setRouteStatus(selectedRoute.status);
        }
    }, [selectedRoute]);

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

    return (
        <div className="h-screen flex">

            <div className="w-80 bg-white shadow-lg p-4 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-black">
                        {isEditing ? 'Chỉnh sửa lộ trình' : (isCreatingRoute ? 'Tạo lộ trình mới' : 'Danh sách lộ trình')}
                    </h2>
                    <button
                        onClick={() => {
                            setIsCreatingRoute(!isCreatingRoute);
                            setSelectedRoute(null);
                            setStops([]);
                            setRouteCoordinates([]);
                            setIsEditing(false);
                            setRouteName('');
                            setRouteDescription('');
                        }}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        {isCreatingRoute ? 'Xem danh sách' : 'Tạo mới'}
                    </button>
                </div>

                {!isCreatingRoute ? (
                    <div className="space-y-2">
                        {!selectedRoute ? (
                            // Danh sách routes
                            savedRoutes.map((route, index) => (
                                <div
                                    key={route._id || index}
                                    className="p-3 rounded-lg bg-gray-50"
                                >
                                    <div className="flex justify-between items-center">
                                        <div
                                            className="flex-grow cursor-pointer"
                                            onClick={() => selectRoute(route)}
                                        >
                                            <div className="font-medium text-black">{route.name}</div>
                                            <div className="text-sm text-gray-600">
                                                {new Date(route.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                console.log('Full route object:', route);
                                                console.log('Editing route with ID:', route._id);
                                                handleEditRoute(route);
                                            }}
                                            className="p-2 text-blue-500 hover:text-blue-700"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            // Chi tiết route đã chọn
                            <div className="space-y-4">
                                <button
                                    onClick={() => setSelectedRoute(null)}
                                    className="mb-4 text-blue-500 hover:text-blue-700 flex items-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                    </svg>
                                    Quay lại danh sách
                                </button>
                                <div className="bg-white rounded-lg p-4 shadow-sm">
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
                ) : (
                    // Form tạo/chỉnh sửa route
                    <>
                        <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
                            <div className="space-y-2">
                                <label htmlFor="routeName" className="block text-sm font-medium text-gray-700">
                                    Tên lộ trình
                                </label>
                                <input
                                    id="routeName"
                                    type="text"
                                    value={routeName}
                                    onChange={(e) => setRouteName(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out text-black"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="routeDescription" className="block text-sm font-medium text-gray-700 ">
                                    Mô tả lộ trình
                                </label>
                                {/* convert it to text area */}
                                <input
                                    id="routeDescription"
                                    type="text"
                                    placeholder="Nhập mô tả lộ trình"
                                    value={routeDescription}
                                    onChange={(e) => setRouteDescription(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out  text-black"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="routeStatus" className="block text-sm font-medium text-gray-700">
                                    Trạng thái
                                </label>
                                <select
                                    id="routeStatus"
                                    value={routeStatus}
                                    onChange={(e) => setRouteStatus(e.target.value as 'draft' | 'active' | 'inactive')}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out text-black"
                                >
                                    {STATUS_OPTIONS.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="route-list">
                            {stops.map((stop, index) => (
                                <div
                                    key={stop.id}
                                    className="flex items-center justify-between p-3 mb-2 rounded-lg"
                                    style={{ backgroundColor: `${stop.color}20` }}
                                >
                                    <div>
                                        <div className="font-semibold" style={{ color: stop.color }}>
                                            Điểm dừng {index + 1}: {stop.name}
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
                        </div>
                        {stops.length >= 2 && routeCoordinates.length > 0 && (
                            <>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                        </svg>
                                        <span>Thời gian dự kiến: {estimatedDuration} phút</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                        <span>Khoảng cách dự kiến: {totalDistance} km</span>
                                    </div>
                                </div>

                                <button
                                    onClick={saveRoute}
                                    disabled={isLoading}
                                    className={`w-full mt-4 bg-green-500 text-white py-2 px-4 rounded 
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'}`}
                                >
                                    {isLoading ? 'Đang lưu...' : 'Lưu lộ trình'}
                                </button>
                            </>
                        )}
                    </>
                )}
            </div>

            <div className="flex-grow">
                <MapContainer
                    center={mapCenter}
                    zoom={15.5}
                    style={{ height: '100%', width: '100%' }}
                    maxBounds={[
                        [10.830000, 106.830000], // Tọa độ góc dưới bên trái
                        [10.850000, 106.860000]  // Tọa độ góc trên bên phải
                    ]}
                    maxBoundsViscosity={1.0} // Tăng độ nhạy của giới hạn
                    minZoom={16} // Giới hạn mức zoom tối thiểu
                    maxZoom={19} // Giới hạn mức zoom tối đa
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {isCreatingRoute ? (
                        isEditing ? (
                            selectedRoute && (
                                <>
                                    <SavedRouteDisplay
                                        coordinates={routeCoordinates.map(coord =>
                                            L.latLng(coord.lat, coord.lng)
                                        )}
                                    />
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
                            )
                        ) :
                            (
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
                            )
                    ) : (
                        selectedRoute && (
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
                        )
                    )
                    }
                </MapContainer>
            </div>
        </div >
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
