'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder';
import { io } from 'socket.io-client';
import { useUserLocation } from '../hooks/useUserLocation';
import CoordinatesDisplay from './CoordinatesDisplay';
import { LatLngTuple } from 'leaflet';
import './map.css'


const socket = io('ws://localhost:8081'); // Connect to the WebSocket server

function MapUpdater({ center }: { center: LatLngTuple }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

function RoutingMachine({ start, end }: { start: L.LatLng | null; end: L.LatLng | null }) {
    const map = useMap();
    const routingControlRef = React.useRef<L.Routing.Control | null>(null);

    useEffect(() => {
        if (!map || !start || !end) return;

        if (routingControlRef.current) {
            map.removeControl(routingControlRef.current);
            routingControlRef.current = null;
        }

        routingControlRef.current = L.Routing.control({
            waypoints: [start, end],
            routeWhileDragging: true,
            addWaypoints: true,
            waypointMode: 'snap',
            showAlternatives: false,
            geocoder: L.Control.Geocoder.nominatim(),
            createMarker: function (i: number, waypoint: any, n: number) {
                const marker = L.marker(waypoint.latLng, {
                    draggable: true,
                    icon: createCustomIcon({ color: i === 0 ? 'black' : i === n - 1 ? '#e74c3c' : '#f1c40f' })
                });
                return marker;
            },
            lineOptions: {
                styles: [{ color: '#3498db', weight: 6, opacity: 0.9 }]
            },
            router: L.Routing.osrmv1({
                serviceUrl: 'https://router.project-osrm.org/route/v1',
                profile: 'driving'
            }),
            collapsible: true,
            show: true,
            autoRoute: true,
        }).addTo(map);

        return () => {
            if (routingControlRef.current && map) {
                map.removeControl(routingControlRef.current);
            }
        };
    }, [map, start, end]);

    return null;
}

function MapClickHandler({ onMapClick }: { onMapClick: (latlng: L.LatLng) => void }) {
    useMapEvents({
        click: (e) => {
            onMapClick(e.latlng);
        },
    });
    return null;
}

const createCustomIcon = ({ color }: { color: string }) => {
    return L.divIcon({
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" class="size-6">
  <path fill-rule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clip-rule="evenodd" />
</svg>`,
        className: '',
        iconSize: [40, 40],
        iconAnchor: [16, 32],
    });
};

export default function Map() {
    const { location, error, isTracking, toggleTracking } = useUserLocation();
    const [mapCenter, setMapCenter] = useState<LatLngTuple>([10.842, 106.843]);
    const mapRef = useRef<L.Map | null>(null);
    const [destination, setDestination] = useState<L.LatLng | null>(null);
    const [carPositions, setCarPositions] = useState<{ [key: string]: L.LatLng | null }>({
        car1: null,
        car2: null,
        car3: null,
    });

    const customIcon = createCustomIcon({ color: '#5499c7' });
    const mapPickIcon = createCustomIcon({ color: '#ec7063' });
    const carIcon = createCustomIcon({ color: '#f1c40f' });

    useEffect(() => {
        if (location) {
            setMapCenter([location.latitude, location.longitude]);
        }
    }, [location]);

    useEffect(() => {
        // Subscribe to all cars when the component mounts
        socket.emit('customer-subscribe', 'car1');
        socket.emit('customer-subscribe', 'car2');
        socket.emit('customer-subscribe', 'car3');

        // Listen for car position updates
        socket.on('car-position', (data) => {
            console.log('Car position update:', data);
            setCarPositions((prev) => ({
                ...prev,
                [data.car]: L.latLng(data.lat, data.lng),
            }));
        });

        return () => {
            socket.off('car-position');
        };
    }, []);

    const handleMapClick = useCallback((latlng: L.LatLng) => {
        setDestination(latlng);
    }, []);

    return (
        <div className="h-screen flex flex-col">
            <div className="p-4 bg-white shadow-md z-10 text-black">
                <h1 className="text-xl font-bold">Track All Cars</h1>
                <div className="mt-2 flex justify-between items-center">
                    <CoordinatesDisplay location={location} />
                    <button
                        onClick={toggleTracking}
                        className={`px-4 py-2 rounded ${isTracking ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
                    >
                        {isTracking ? 'Stop Tracking' : 'Start Tracking'}
                    </button>
                    {location && !destination && (
                        <p className="mt-2 text-sm text-gray-600">Click on the map to set your destination.</p>
                    )}
                    {error && (
                        <p className="mt-2 text-sm text-red-600">{error}</p>
                    )}
                </div>
            </div>
            {error && <div className="p-4 bg-red-100 text-red-700">{error}</div>}
            <div className="flex-grow">
                <MapContainer
                    center={mapCenter}
                    zoom={100}
                    style={{ height: '100%', width: '100%' }}
                    ref={mapRef}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {Object.entries(carPositions).map(([car, position]) =>
                        position && (
                            <Marker key={car} position={[position.lat, position.lng]} icon={carIcon}>
                                <Popup>{`Car ${car}`}</Popup>
                            </Marker>
                        )
                    )}
                    {location && (
                        <Marker position={[location.latitude, location.longitude]} icon={customIcon}>
                            <Popup>You are here</Popup>
                        </Marker>
                    )}
                    {destination && (
                        <Marker position={destination} icon={mapPickIcon}>
                            <Popup>Destination</Popup>
                        </Marker>
                    )}
                    {location && destination && (
                        <RoutingMachine
                            start={L.latLng(location.latitude, location.longitude)}
                            end={destination}
                        />
                    )}
                    {/* <MapUpdater center={mapCenter} /> */}
                    <MapClickHandler onMapClick={handleMapClick} />
                </MapContainer>
            </div>
        </div>
    );
}