import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const busStops = [
    { id: 1, name: "Trạm Xe Bus 1", lat: 10.776, lng: 106.700 },
    { id: 2, name: "Trạm Xe Bus 2", lat: 10.778, lng: 106.703 },
];

const Map = () => {
    return (
        <MapContainer center={[10.776, 106.700]} zoom={15} style={{ height: "100vh", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {busStops.map((stop) => (
                <Marker key={stop.id} position={[stop.lat, stop.lng]}>
                    <Popup>{stop.name}</Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default Map;
