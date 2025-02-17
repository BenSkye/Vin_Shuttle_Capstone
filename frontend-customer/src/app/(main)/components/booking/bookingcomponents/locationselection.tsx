import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useMediaQuery } from "react-responsive";

// Dynamic import for Map component to prevent SSR issues
const MapWithNoSSR = dynamic(() => import("../../Map"), {
    ssr: false,
    loading: () => <p>Loading Map...</p>,
});

interface LocationSelectionProps {
    pickup: string;
    onPickupChange: (value: string) => void;
    detectUserLocation: () => void;
    loading: boolean;
}

const LocationSelection = ({
    pickup,
    onPickupChange,
    detectUserLocation,
    loading,
}: LocationSelectionProps) => {
    const isMobile = useMediaQuery({ maxWidth: 768 });
    const [isFetchingAddress, setIsFetchingAddress] = useState(false);

    const handleDetectUserLocation = () => {
        setIsFetchingAddress(true);
        detectUserLocation();

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const address = await reverseGeocode(latitude, longitude);
                        onPickupChange(address);
                    } catch (error) {
                        console.error("Error fetching address:", error);
                    } finally {
                        setIsFetchingAddress(false);
                    }
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setIsFetchingAddress(false);
                }
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
            setIsFetchingAddress(false);
        }
    };

    const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
        const apiKey = "YOUR_GOOGLE_MAPS_API_KEY"; // Replace with your Google Maps API key
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === "OK") {
            return data.results[0].formatted_address;
        } else {
            throw new Error("Unable to fetch address");
        }
    };

    return (
        <div className="w-full">
            {/* Search Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <input
                    type="text"
                    className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Nhập địa điểm đón"
                    value={pickup}
                    onChange={(e) => onPickupChange(e.target.value)}
                />
                <button
                    className="w-full bg-blue-500 text-white p-3 rounded-lg shadow-md hover:bg-blue-600 transition-all"
                    onClick={handleDetectUserLocation}
                    disabled={isFetchingAddress || loading}
                >
                    {isFetchingAddress ? "Đang tìm địa chỉ..." : "Sử dụng vị trí của tôi"}
                </button>
            </div>

            {/* Loading Indicator */}
            {(loading || isFetchingAddress) && (
                <div className="flex justify-center mb-6">
                    <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
            )}

            {/* Map Container */}
            <div className={`rounded-lg overflow-hidden shadow-lg ${isMobile ? "h-[450px]" : "h-[700px]"}`}>
                <MapWithNoSSR pickup={pickup} />
            </div>
        </div>
    );
};

export default LocationSelection;
