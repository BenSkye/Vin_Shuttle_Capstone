'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder';
import './map.css';
import { routeService, RouteRequest, RouteResponse } from '../../services/routeService';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import Sidebar from '../common/Sidebar';

interface BusStop {
  id: number;
  position: L.LatLng;
  name: string;
  color: string;
}

const COLORS = ['#2ecc71', '#e74c3c', '#f1c40f', '#9b59b6', '#3498db', '#e67e22', '#1abc9c', '#34495e'];

const createCustomIcon = (color: string) => {
  return L.divIcon({
    html: `
      <div class="relative inline-block">
        <div class="relative">
          <div class="absolute -inset-2 animate-ping rounded-full bg-primary-400 opacity-20"></div>
          <div class="relative rounded-full bg-white p-2 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" class="size-7">
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
    popupAnchor: [0, -40],
  });
};

L.Marker.prototype.options.icon = L.icon({
  iconUrl: icon.src,
  iconRetinaUrl: iconRetina.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Bản nháp' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Ngừng hoạt động' },
];

function RoutingMachine({
  stops,
  onRouteFound,
}: {
  stops: BusStop[];
  onRouteFound: (coordinates: L.LatLng[], estimatedDuration: number, totalDistance: number) => void;
  isEditing: boolean;
}) {
  const map = useMap();
  const routingControlRef = useRef<L.Routing.Control | null>(null);

  useEffect(() => {
    if (!map || stops.length < 2) return;

    // Xóa routing control cũ nếu tồn tại
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }

    // Tạo mới routing control với danh sách waypoints
    const waypoints = stops.map((stop) => stop.position);
    routingControlRef.current = L.Routing.control({
      waypoints,
      router: L.routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
      routeWhileDragging: true,
      addWaypoints: true,
      fitSelectedRoutes: true,
      showAlternatives: false,
      show: false,
      lineOptions: {
        styles: [{ color: '#3498db', weight: 2, opacity: 0.9 }],
        extendToWaypoints: true,
        missingRouteTolerance: 5,
      },
      plan: L.Routing.plan(waypoints, {
        createMarker: () => false,
      }),
    }).addTo(map);

    // Lắng nghe sự kiện routesfound
    routingControlRef.current.on('routesfound', (e) => {
      const route = e.routes[0];
      onRouteFound(
        route.coordinates,
        Number((route.summary.totalTime / 60).toFixed(1)),
        Number((route.summary.totalDistance / 1000).toFixed(1))
      );
    });

    // Cleanup khi component unmount hoặc stops thay đổi
    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [map, stops, onRouteFound]);

  return null;
}

function SavedRouteDisplay({ coordinates }: { coordinates: L.LatLng[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const polyline = L.polyline(coordinates, { color: '#3498db', weight: 6, opacity: 0.9 }).addTo(map);
    map.fitBounds(polyline.getBounds());
    return () => {
      void map.removeLayer(polyline);
    };
  }, [map, coordinates]);

  return null;
}

const getStreetName = async (latlng: L.LatLng) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json`
  );
  const data = await response.json();
  return data.display_name?.split(',').slice(0, 2).join(', ') || 'Tên đường không tìm thấy';
};

export default function CreateRoute() {
  const [stops, setStops] = useState<BusStop[]>([]);
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
    routeService.getAllRoutes().then(setSavedRoutes).catch(console.error);
    if (selectedRoute) {
      setRouteName(selectedRoute.name);
      setRouteDescription(selectedRoute.description);
      setRouteStatus(selectedRoute.status);
    }
  }, [selectedRoute]);

  const handleRouteFound = useCallback(
    (coordinates: L.LatLng[], duration: number, distance: number) => {
      setRouteCoordinates(coordinates);
      setEstimatedDuration(duration);
      setTotalDistance(distance);
    },
    []
  );

  const handleMapClick = useCallback(async (latlng: L.LatLng) => {
    const name = await getStreetName(latlng);
    setStops((prev) => [
      ...prev,
      { id: prev.length, position: latlng, name, color: COLORS[prev.length % COLORS.length] },
    ]);
  }, []);

  const removeStop = useCallback((id: number) => setStops((prev) => prev.filter((stop) => stop.id !== id)), []);

  const handleEditRoute = useCallback((route: RouteResponse) => {
    setIsEditing(true);
    setSelectedRoute(route);
    setIsCreatingRoute(true);
    setRouteName(route.name);
    setRouteDescription(route.description);
    setRouteStatus(route.status);
    setStops(
      route.waypoints.map((w, i) => ({
        id: w.id,
        position: L.latLng(w.position.lat, w.position.lng),
        name: w.name,
        color: COLORS[i % COLORS.length],
      }))
    );
    // Khởi tạo routeCoordinates từ scenicRouteCoordinates, nhưng sẽ được cập nhật bởi RoutingMachine
    setRouteCoordinates(route.scenicRouteCoordinates.map((c) => L.latLng(c.lat, c.lng)));
  }, []);

  const prepareRouteData = useCallback((): RouteRequest => ({
    name: routeName,
    description: routeDescription,
    waypoints: stops.map((stop) => ({
      id: stop.id,
      name: stop.name,
      position: { lat: stop.position.lat, lng: stop.position.lng },
    })),
    scenicRouteCoordinates: routeCoordinates.map((coord) => ({ lat: coord.lat, lng: coord.lng })),
    estimatedDuration,
    totalDistance,
    status: routeStatus,
  }), [routeName, routeDescription, stops, routeCoordinates, estimatedDuration, totalDistance, routeStatus]);

  const saveRoute = useCallback(async () => {
    if (!routeName.trim()) {
      alert('Tên lộ trình không được để trống!');
      return;
    }
    if (routeCoordinates.length === 0 || stops.length < 2) {
      alert('Cần ít nhất 2 điểm dừng và lộ trình hợp lệ!');
      return;
    }
    setIsLoading(true);
    try {
      const routeData = prepareRouteData();
      const route = isEditing && selectedRoute?._id
        ? await routeService.editRoute(selectedRoute._id, routeData)
        : await routeService.createRoute(routeData);
      setSavedRoutes((prev) =>
        isEditing ? prev.map((r) => (r._id === route._id ? route : r)) : [...prev, route]
      );
      setSelectedRoute(route);
      setIsCreatingRoute(false);
      setIsEditing(false);
      alert(isEditing ? 'Đã cập nhật lộ trình!' : 'Đã lưu lộ trình!');
    } catch (error) {
      console.error('Lỗi lưu lộ trình:', error);
      alert('Không thể lưu lộ trình!');
    } finally {
      setIsLoading(false);
    }
  }, [isEditing, selectedRoute, routeCoordinates, stops, prepareRouteData, routeName]);

  const selectRoute = useCallback((route: RouteResponse) => {
    setSelectedRoute(route);
    setIsCreatingRoute(false);
  }, []);

  const renderStatusBadge = (status: 'draft' | 'active' | 'inactive') => {
    const config = {
      draft: 'bg-gray-200 text-gray-800',
      active: 'bg-green-200 text-green-800',
      inactive: 'bg-red-200 text-red-800',
    }[status];
    return (
      <span className={`px-2 py-1 rounded-full text-sm ${config}`}>
        {STATUS_OPTIONS.find((o) => o.value === status)?.label}
      </span>
    );
  };

  return (
    <div className="h-screen flex">
      <Sidebar />
      <div className="w-80 bg-white shadow-lg p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black">
            {isEditing ? 'Chỉnh sửa lộ trình' : isCreatingRoute ? 'Tạo lộ trình mới' : 'Danh sách lộ trình'}
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
              savedRoutes.map((route) => (
                <div key={route._id} className="p-3 rounded-lg bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div className="flex-grow cursor-pointer" onClick={() => selectRoute(route)}>
                      <div className="font-medium text-black">{route.name}</div>
                      <div className="text-sm text-gray-600">{new Date(route.createdAt).toLocaleDateString()}</div>
                    </div>
                    <button
                      onClick={() => handleEditRoute(route)}
                      className="p-2 text-blue-500 hover:text-blue-700"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="space-y-4">
                <button
                  onClick={() => setSelectedRoute(null)}
                  className="mb-4 text-blue-500 hover:text-blue-700 flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Quay lại
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
                          <span className="font-medium text-gray-700">{index + 1}.</span>
                          <span className="text-gray-600">{waypoint.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{selectedRoute.waypoints.length} điểm dừng</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Thời gian: {selectedRoute.estimatedDuration} phút</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Khoảng cách: {selectedRoute.totalDistance} km</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="font-medium">Trạng thái:</span>
                      {renderStatusBadge(selectedRoute.status)}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {!savedRoutes.length && <p className="text-gray-500 text-center">Chưa có lộ trình</p>}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
              <div>
                <label htmlFor="routeName" className="block text-sm font-medium text-gray-700">
                  Tên lộ trình <span className="text-red-500">*</span>
                </label>
                <input
                  id="routeName"
                  type="text"
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>
              <div>
                <label htmlFor="routeDescription" className="block text-sm font-medium text-gray-700">
                  Mô tả
                </label>
                <textarea
                  id="routeDescription"
                  value={routeDescription}
                  onChange={(e) => setRouteDescription(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>
              <div>
                <label htmlFor="routeStatus" className="block text-sm font-medium text-gray-700">
                  Trạng thái
                </label>
                <select
                  id="routeStatus"
                  value={routeStatus}
                  onChange={(e) => setRouteStatus(e.target.value as 'draft' | 'active' | 'inactive')}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              {stops.map((stop, index) => (
                <div
                  key={stop.id}
                  className="flex items-center justify-between p-3 mb-2 rounded-lg"
                  style={{ backgroundColor: `${stop.color}20` }}
                >
                  <div className="font-semibold" style={{ color: stop.color }}>
                    Điểm dừng {index + 1}: {stop.name}
                  </div>
                  <button
                    onClick={() => removeStop(stop.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
              {!stops.length && (
                <p className="text-gray-500 text-center">Nhấp vào bản đồ để thêm điểm dừng</p>
              )}
            </div>
            {stops.length >= 2 && routeCoordinates.length > 0 && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Thời gian: {estimatedDuration} phút</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Khoảng cách: {totalDistance} km</span>
                  </div>
                </div>
                <button
                  onClick={saveRoute}
                  disabled={isLoading}
                  className={`w-full mt-4 py-2 px-4 rounded text-white ${
                    isLoading ? 'bg-green-300 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {isLoading ? 'Đang lưu...' : 'Lưu lộ trình'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
      <div className="flex-grow">
        <MapContainer
          center={[10.840405, 106.843424]}
          zoom={15.5}
          style={{ height: '100%', width: '100%' }}
          maxBounds={[
            [10.830000, 106.830000],
            [10.850000, 106.860000],
          ]}
          maxBoundsViscosity={1.0}
          minZoom={15}
          maxZoom={18}
        >
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {isCreatingRoute ? (
            <>
              {stops.map((stop) => (
                <Marker key={stop.id} position={stop.position} icon={createCustomIcon(stop.color)}>
                  <Popup>{stop.name}</Popup>
                </Marker>
              ))}
              {stops.length >= 2 && (
                <RoutingMachine
                  stops={stops}
                  onRouteFound={handleRouteFound}
                  isEditing={isEditing}
                />
              )}
              <MapClickHandler onMapClick={handleMapClick} />
            </>
          ) : (
            selectedRoute && (
              <>
                <SavedRouteDisplay
                  coordinates={selectedRoute.scenicRouteCoordinates.map((c) => L.latLng(c.lat, c.lng))}
                />
                {selectedRoute.waypoints.map((waypoint, index) => (
                  <Marker
                    key={waypoint.id}
                    position={L.latLng(waypoint.position.lat, waypoint.position.lng)}
                    icon={createCustomIcon(COLORS[index % COLORS.length])}
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
  useMapEvents({ click: (e) => onMapClick(e.latlng) });
  return null;
}