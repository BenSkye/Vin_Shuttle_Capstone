import L from "leaflet";

export interface MapProps {
    pickup: string;
    destination: string;
}

export interface MapLocation {
    lat: number;
    lng: number;
    address: string;
}

export interface MapState {
    pickupLocation: L.LatLng | null;
    destinationLocation: L.LatLng | null;
    map: L.Map | null;
    error: string | null;
}
