import React, { useState, useEffect } from "react";
import 'leaflet/dist/leaflet.css';
import dynamic from "next/dynamic";
import '../../../../../styles/locationselection.css';
import L from 'leaflet';
import { useMap } from 'react-leaflet';

// Dynamic imports
const MapContainer = dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false }
);
const Marker = dynamic(
    () => import('react-leaflet').then((mod) => mod.Marker),
    { ssr: false }
);
const Popup = dynamic(
    () => import('react-leaflet').then((mod) => mod.Popup),
    { ssr: false }
);

// Fix icon chỉ ở phía client
if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
}

interface LocationSelectionProps {
    pickup: string;
    onPickupChange: (value: string) => void;
    detectUserLocation: () => void;
    loading: boolean;
    lat: number;
    lng: number;
    onPositionChange: (lat: number, lng: number) => void;
}

const MapClickHandler = ({ onMapClick }: { onMapClick: (latlng: L.LatLng) => void }) => {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        const handleClick = (e: L.LeafletMouseEvent) => {
            onMapClick(e.latlng);
        };

        map.on('click', handleClick);
        return () => {
            map.off('click', handleClick);
        };
    }, [map, onMapClick]);

    return null;
};

// Hàm geocode để tìm kiếm địa chỉ
const geocode = async (query: string): Promise<[number, number]> => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
        );
        const data = await response.json();

        if (!data || data.length === 0) throw new Error("Không tìm thấy địa chỉ");

        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    } catch (error) {
        console.error('Geocoding error:', error);
        throw new Error('Không thể tìm tọa độ từ địa chỉ');
    }
};

// Hàm reverse geocode
const reverseGeocodeOSM = async (lat: number, lon: number): Promise<string> => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
        );
        const data = await response.json();
        return data.display_name || 'Không xác định được địa chỉ';
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        throw new Error('Không thể lấy địa chỉ từ tọa độ');
    }
};

const LocationSelection = ({
    pickup,
    onPickupChange,
    detectUserLocation,
    loading,
    lat,
    lng,
    onPositionChange,
}: LocationSelectionProps) => {
    const [isFetching, setIsFetching] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [searchQuery, setSearchQuery] = useState(pickup);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!searchQuery) return;

        try {
            setIsFetching(true);
            const [newLat, newLng] = await geocode(searchQuery);
            onPositionChange(newLat, newLng);
            onPickupChange(await reverseGeocodeOSM(newLat, newLng));
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsFetching(false);
        }
    };

    const handleMapClick = async (latlng: L.LatLng) => {
        try {
            setIsFetching(true);
            const address = await reverseGeocodeOSM(latlng.lat, latlng.lng);
            onPickupChange(address);
            onPositionChange(latlng.lat, latlng.lng);

            // Force update map view
            const map = L.map('map');
            map.setView(latlng, 15);
        } catch (error) {
            console.error('Map click error:', error);
        } finally {
            setIsFetching(false);
        }
    };

    if (!isClient) return null;

    return (
        <div className="w-full space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập địa điểm đón"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
                        disabled={isFetching || loading}
                    >
                        {isFetching ? '...' : 'Tìm'}
                    </button>
                </form>
                <button
                    className="bg-blue-500 text-white p-3 rounded-lg shadow-md hover:bg-blue-600 transition-all"
                    onClick={detectUserLocation}
                    disabled={isFetching || loading}
                >
                    {isFetching ? "Đang tìm..." : "Vị trí hiện tại"}
                </button>
            </div>

            <div className="map-container">
                <MapContainer
                    id="map"
                    center={[lat || 10.840405, lng || 106.843424]}
                    zoom={lat && lng ? 15 : 13}
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {lat && lng && (
                        <Marker position={[lat, lng]}>
                            <Popup className="font-semibold">
                                📍 Điểm đón của bạn
                            </Popup>
                        </Marker>
                    )}

                    <MapClickHandler onMapClick={handleMapClick} />
                </MapContainer>
            </div>
        </div>
    );
};

export default LocationSelection;
