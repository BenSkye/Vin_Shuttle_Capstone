import L from 'leaflet'

export interface MapProps {
  pickup: string
}

export interface MapLocation {
  lat: number
  lng: number
  address: string
}

export interface LocationPoint {
  position: { lat: number; lng: number }
  address: string
}


export interface MapState {
  pickupLocation: L.LatLng | null

  map: L.Map | null
  error: string | null
}

export interface DestinationSelectionProps {
  endPoint: {
    position: { lat: number; lng: number }
    address: string
  }
  onLocationChange: (position: { lat: number; lng: number }, address: string) => void
  detectUserLocation: () => void
  loading: boolean
}
