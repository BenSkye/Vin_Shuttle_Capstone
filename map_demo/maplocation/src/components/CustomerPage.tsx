'use client';
import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { io } from 'socket.io-client';
import { useUserLocation } from '../hooks/useUserLocation';

const socket = io('ws://localhost:8081', {
    transports: ['websocket'],
});// Connect to the WebSocket server

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

export default function CustomerPage() {
    const { location, error, isTracking, toggleTracking } = useUserLocation();
    const [carPositions, setCarPositions] = useState<{ [key: string]: L.LatLng | null }>({
        car1: null,
        car2: null,
        car3: null,
    });
    const mapRef = useRef<L.Map | null>(null);

    const carIcon = createCustomIcon({ color: '#f1c40f' });

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

    return (
        <div className="h-screen flex flex-col">
            <div className="p-4 bg-white shadow-md z-10">
                <h1 className="text-xl font-bold">Track All Cars</h1>
                <div className="mt-4">
                    <button
                        onClick={toggleTracking}
                        className={`px-4 py-2 rounded ${isTracking ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
                    >
                        {isTracking ? 'Stop Tracking' : 'Start Tracking'}
                    </button>
                </div>
                {error && (
                    <p className="mt-4 text-red-600">{error}</p>
                )}
            </div>
            <div className="flex-grow">
                {typeof window !== 'undefined' && (
                    <MapContainer
                        center={[10.842, 106.843]}
                        zoom={13}
                        ref={mapRef}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {location && (
                            <Marker position={[location.latitude, location.longitude]} icon={createCustomIcon({ color: '#5499c7' })}>
                                <Popup>You are here</Popup>
                            </Marker>
                        )}
                        {Object.entries(carPositions).map(([car, position]) =>
                            position && (
                                <Marker key={car} position={[position.lat, position.lng]} icon={carIcon}>
                                    <Popup>{`Car ${car}`}</Popup>
                                </Marker>
                            )
                        )}
                    </MapContainer>
                )}
            </div>
        </div>
    );
}