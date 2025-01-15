import React from 'react';

interface CoordinatesDisplayProps {
    location: GeolocationCoordinates | null;
}

export default function CoordinatesDisplay({ location }: CoordinatesDisplayProps) {
    if (!location) return null;

    return (
        <div className="text-sm">
            Lat: {location.latitude.toFixed(6)}, Lon: {location.longitude.toFixed(6)}
        </div>
    );
}

