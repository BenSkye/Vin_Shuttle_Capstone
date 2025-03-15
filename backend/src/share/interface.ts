

export interface tokenDTO {
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayload {
  _id: string;
  name: string;
  role: string;
  phone: string;
}

export interface Position {
  lat: number;
  lng: number;
}

export interface StartOrEndPoint {
  position: Position;
  address: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  timestamp?: number;
}

export interface TrackingData {
  vehicleId: string;
  location: LocationData;
}



export const HEADER = {
  CLIENT_ID: 'x-client-id',
  AUTHORIZATION: 'authorization',
  REFRESH_TOKEN: 'x-refresh-token',
};
