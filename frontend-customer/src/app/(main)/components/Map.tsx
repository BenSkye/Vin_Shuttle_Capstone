import React, { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import debounce from "lodash/debounce";
import { MapProps, MapState } from "../../../interface/map.types";

// Custom Icon for Pickup Location
const PickupIcon = new L.Icon({
    iconUrl: "https://img.icons8.com/color/48/4caf50/marker.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

const Map = ({ pickup }: MapProps) => {
    const [state, setState] = useState<MapState>({
        pickupLocation: null,
        map: null,
        error: null,
    });
    const mapRef = useRef<L.Map | null>(null);

    const searchLocation = useCallback(debounce(async (query: string) => {
        if (!query.trim()) {
            setState((prev) => ({
                ...prev,
                pickupLocation: null,
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
                setState((prev) => ({
                    ...prev,
                    error: "Không tìm thấy điểm đón.",
                    pickupLocation: null,
                }));
                return;
            }

            const location = new L.LatLng(parseFloat(data[0].lat), parseFloat(data[0].lon));
            setState((prev) => ({
                ...prev,
                pickupLocation: location,
                error: null,
            }));

            if (mapRef.current) {
                mapRef.current.setView(location, 15);
            }
        } catch (error) {
            console.error("Error searching location:", error);
            setState((prev) => ({
                ...prev,
                error: "Không thể lấy dữ liệu vị trí.",
                pickupLocation: null,
            }));
        }
    }, 500), [pickup]);

    useEffect(() => {
        if (pickup) searchLocation(pickup);
    }, [pickup, searchLocation]);

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
                        <strong>Điểm đón:</strong>
                        <br />
                        {pickup}
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
