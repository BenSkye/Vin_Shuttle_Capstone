import { StartOrEndPoint } from './share-itinerary'; // Thêm import cho interface StartOrEndPoint

export interface LocationData {
  latitude: number;
  longitude: number;
  heading: number | null;
  speed: number | null;
}
export interface Position {
  lat: number;
  lng: number;
}

export interface Trip {
  _id: string;
  driverId: {
    _id: string;
    name: string;
  };
  customerId: {
    _id: string;
    name: string;
    phone: string;
  };
  vehicleId: {
    _id: string;
    name: string;
    licensePlate: string;
  };
  amount: number;
  status: string;
  statusHistory: object[];
  serviceType: string;
  servicePayload:
    | BookingHourPayloadDto
    | BookingScenicRoutePayloadDto
    | BookingDestinationPayloadDto
    | BookingSharePayloadDto;
}

export interface BookingHourPayloadDto {
  bookingHour: {
    totalTime: number;
    startPoint: {
      position: {
        lat: number;
        lng: number;
      };
      address: string;
    };
  };
}

export interface BookingScenicRoutePayloadDto {
  bookingScenicRoute: {
    routeId: string | ScenicRouteDto;
    startPoint: {
      position: {
        lat: number;
        lng: number;
      };
      address: string;
    };
    distanceEstimate: number;
    distance: number;
    estimatedDuration?: number;
  };
}

export interface ScenicRouteDto {
  _id: string;
  name: string;
  description: string;
  status: string;
  waypoints: Waypoint[];
  scenicRouteCoordinates: Coordinate[];
  estimatedDuration: number;
  totalDistance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Waypoint {
  id: number;
  name: string;
  position: {
    lat: number;
    lng: number;
  };
}

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface BookingDestinationPayloadDto {
  bookingDestination: {
    startPoint: {
      position: {
        lat: number;
        lng: number;
      };
      address: string;
    };
    endPoint: {
      position: {
        lat: number;
        lng: number;
      };
      address: string;
    };
    distanceEstimate: number;
    distance: number;
  };
}

export interface BookingSharePayloadDto {
  bookingShare: {
    sharedItinerary: string;   // ID của shared itinerary
    numberOfSeat: number;      // Số ghế đặt
    startPoint: StartOrEndPoint;
    endPoint: StartOrEndPoint;
    distanceEstimate: number;
    distance: number;
  };
}

export interface Rating {
  _id: string;
  tripId: Trip;
  driverId: string;
  customerId: string;
  rate: number;
  feedback: string;
  createdAt: string;
  updatedAt: string;
}

