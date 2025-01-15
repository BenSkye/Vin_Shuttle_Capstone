'use client';
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useUserLocation } from '../hooks/useUserLocation';

const socket = io('ws://localhost:8081', {
    transports: ['websocket'],
}); // Connect to the WebSocket server

export default function DriverPage() {
    const { location, error, isTracking, toggleTracking } = useUserLocation();
    const [selectedCar, setSelectedCar] = useState<string | null>(null);

    useEffect(() => {
        if (isTracking && selectedCar && location) {
            // Send the driver's location to the server
            console.log('Sending driver update:', selectedCar, location);
            socket.emit('driver-update', {
                car: selectedCar,
                lat: location.latitude,
                lng: location.longitude,
            });
        }
    }, [location, isTracking, selectedCar]);

    return (
        <div className="h-screen flex flex-col items-center justify-center">
            <h1 className="text-xl font-bold">Select Your Car</h1>
            <div className="mt-4 flex space-x-4">
                <button
                    onClick={() => setSelectedCar('car1')}
                    className={`px-4 py-2 rounded ${selectedCar === 'car1' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                    Car 1
                </button>
                <button
                    onClick={() => setSelectedCar('car2')}
                    className={`px-4 py-2 rounded ${selectedCar === 'car2' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                    Car 2
                </button>
                <button
                    onClick={() => setSelectedCar('car3')}
                    className={`px-4 py-2 rounded ${selectedCar === 'car3' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                    Car 3
                </button>
            </div>
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
            {location && (
                <p className="mt-4">
                    Your location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </p>
            )}
        </div>
    );
}