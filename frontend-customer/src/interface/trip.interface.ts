import { TripCancelBy } from '@/constants/trip.enum'

export interface LocationData {
  latitude: number
  longitude: number
  heading: number | null
  speed: number | null
}

export interface Position {
  lat: number
  lng: number
}

export interface Trip {
  _id: string
  driverId: {
    _id: string
    name: string
  }
  vehicleId: {
    _id: string
    name: string
    licensePlate: string
  }
  timeStartEstimate: number
  timeEndEstimate: number
  amount: number
  status: string
  statusHistory: object[]
  serviceType: string
  isRating: boolean,
  code: string,
  servicePayload:
  | BookingHourPayloadDto
  | BookingScenicRoutePayloadDto
  | BookingDestinationPayloadDto
  | BookingSharePayloadDto
  refundAmount?: number
  cancellationReason?: string
  cancellationTime?: number
  cancelledBy?: TripCancelBy
}

export interface BookingHourPayloadDto {
  bookingHour: {
    totalTime: number
    startPoint: {
      position: {
        lat: number
        lng: number
      }
      address: string
    }
  }
}

export interface BookingScenicRoutePayloadDto {
  bookingScenicRoute: {
    routeId: string
    startPoint: {
      position: {
        lat: number
        lng: number
      }
      address: string
    }
    distanceEstimate: number
    distance: number
  }
}

export interface BookingDestinationPayloadDto {
  bookingDestination: {
    startPoint: {
      position: {
        lat: number
        lng: number
      }
      address: string
    }
    endPoint: {
      position: {
        lat: number
        lng: number
      }
      address: string
    }
    distanceEstimate: number
    distance: number
  }
}

export interface BookingSharePayloadDto {
  bookingShare: {
    sharedItinerary: string
    numberOfSeat: number
    startPoint: {
      position: {
        lat: number
        lng: number
      }
      address: string
    }
    endPoint: {
      position: {
        lat: number
        lng: number
      }
      address: string
    }
    distanceEstimate: number
    distance: number
  }
}
