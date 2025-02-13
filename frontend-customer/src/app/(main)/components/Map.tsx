import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import debounce from "lodash/debounce";
import { MapProps, MapState } from "../../../service/interface/map.types";

// Custom Icons
const PickupIcon = new L.Icon({
    iconUrl: "https://img.icons8.com/color/48/4caf50/marker.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

const DestinationIcon = new L.Icon({
    iconUrl: "https://img.icons8.com/color/48/ff5722/marker.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

const Map = ({ pickup, destination }: MapProps) => {
    const [state, setState] = useState<MapState>({
        pickupLocation: null,
        destinationLocation: null,
        map: null,
        error: null
    });
    const mapRef = useRef<L.Map | null>(null);

    const searchLocation = debounce(async (query: string, isPickup: boolean) => {
        if (!query.trim()) {
            setState(prev => ({
                ...prev,
                [isPickup ? 'pickupLocation' : 'destinationLocation']: null
            }));
            return;
        }

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=vn`
            );

            if (!response.ok) throw new Error(`Error fetching data: ${response.statusText}`);

            const data = await response.json();
            if (data.length === 0) {
                setState(prev => ({
                    ...prev,
                    error: `Không tìm thấy ${isPickup ? 'điểm đón' : 'điểm đến'}.`,
                    [isPickup ? 'pickupLocation' : 'destinationLocation']: null
                }));
                return;
            }

            const location = new L.LatLng(parseFloat(data[0].lat), parseFloat(data[0].lon));
            setState(prev => ({
                ...prev,
                [isPickup ? 'pickupLocation' : 'destinationLocation']: location,
                error: null
            }));

            if (mapRef.current) {
                mapRef.current.setView(location, 15);
            }
        } catch (error) {
            console.error("Error searching location:", error);
            setState(prev => ({
                ...prev,
                error: "Không thể lấy dữ liệu vị trí.",
                [isPickup ? 'pickupLocation' : 'destinationLocation']: null
            }));
        }
    }, 500);

    useEffect(() => {
        if (pickup) searchLocation(pickup, true);
    }, [pickup]);

    useEffect(() => {
        if (destination) searchLocation(destination, false);
    }, [destination]);

    useEffect(() => {
        if (mapRef.current && state.pickupLocation && state.destinationLocation) {
            const bounds = L.latLngBounds([state.pickupLocation, state.destinationLocation]);
            mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [state.pickupLocation, state.destinationLocation]);

    return (
        <MapContainer
            center={[10.776, 106.700]}
            zoom={13}
            style={{ height: "500px", width: "100%" }}
            ref={mapRef}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {state.pickupLocation && (
                <Marker position={state.pickupLocation} icon={PickupIcon}>
                    <Popup>
                        <strong>Điểm đón:</strong><br />
                        {pickup}
                    </Popup>
                </Marker>
            )}

            {state.destinationLocation && (
                <Marker position={state.destinationLocation} icon={DestinationIcon}>
                    <Popup>
                        <strong>Điểm đến:</strong><br />
                        {destination}
                    </Popup>
                </Marker>
            )}

            {state.error && (
                <Popup position={[10.776, 106.700]} autoClose={false}>
                    <strong>Lỗi:</strong> {state.error}
                </Popup>
            )}
        </MapContainer>
    );
};

export default Map;
