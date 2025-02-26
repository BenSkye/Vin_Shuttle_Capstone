import L from "leaflet";

export interface MapProps {
    pickup: string;

}

export interface MapLocation {
    lat: number;
    lng: number;
    address: string;
}

export interface MapState {
    pickupLocation: L.LatLng | null;

    map: L.Map | null;
    error: string | null;
}
