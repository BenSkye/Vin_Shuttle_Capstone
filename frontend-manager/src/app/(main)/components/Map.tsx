import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Define the Material UI LocationOn Icon as an inline SVG with green color
const pickupIconUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'%3E%3Cpath fill='%234CAF50' d='M12 2C8.13 2 5 5.13 5 9c0 2.53 1.69 5.03 4.15 7.47l.85.85L12 22l2.99-4.68.85-.85C17.31 14.03 19 11.53 19 9c0-3.87-3.13-7-7-7zm0 10.2c-.98 0-1.8-.83-1.8-1.8s.82-1.8 1.8-1.8 1.8.82 1.8 1.8-.82 1.8-1.8 1.8z'/%3E%3C/svg%3E";
const destinationIconUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'%3E%3Cpath fill='%23FF5722' d='M12 2C8.13 2 5 5.13 5 9c0 2.53 1.69 5.03 4.15 7.47l.85.85L12 22l2.99-4.68.85-.85C17.31 14.03 19 11.53 19 9c0-3.87-3.13-7-7-7zm0 10.2c-.98 0-1.8-.83-1.8-1.8s.82-1.8 1.8-1.8 1.8.82 1.8 1.8-.82 1.8-1.8 1.8z'/%3E%3C/svg%3E";

// Create custom Leaflet icons
const PickupIcon = L.icon({
    iconUrl: pickupIconUrl,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});

const DestinationIcon = L.icon({
    iconUrl: destinationIconUrl,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});

interface MapProps {
    pickup: string;
    destination: string;
}

interface Location {
    lat: number;
    lng: number;
    name: string;
}

const Map = ({ pickup, destination }: MapProps) => {
    const [pickupLocation, setPickupLocation] = useState<Location | null>(null);
    const [destinationLocation, setDestinationLocation] = useState<Location | null>(null);

    const searchLocation = async (query: string): Promise<Location | null> => {
        if (!query.trim()) return null;

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=vn`
            );

            if (!response.ok) {
                throw new Error(`Error fetching data: ${response.statusText}`);
            }

            const data = await response.json();
            if (data.length === 0) {
                console.warn("No location found.");
                return null;
            }

            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
                name: query
            };
        } catch (error) {
            console.error("Error searching location:", error);
            return null;
        }
    };

    // Effect for pickup location
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (pickup) {
                const location = await searchLocation(pickup);
                setPickupLocation(location);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [pickup]);

    // Effect for destination location
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (destination) {
                const location = await searchLocation(destination);
                setDestinationLocation(location);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [destination]);

    return (
        <MapContainer
            center={[10.776, 106.700]} // HCMC center
            zoom={13}
            style={{ height: "500px", width: "100%" }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {pickupLocation && (
                <Marker
                    position={[pickupLocation.lat, pickupLocation.lng]}
                    icon={PickupIcon}
                >
                    <Popup>{pickupLocation.name}</Popup>
                </Marker>
            )}
            {destinationLocation && (
                <Marker
                    position={[destinationLocation.lat, destinationLocation.lng]}
                    icon={DestinationIcon}
                >
                    <Popup>{destinationLocation.name}</Popup>
                </Marker>
            )}
        </MapContainer>
    );
};

export default Map;