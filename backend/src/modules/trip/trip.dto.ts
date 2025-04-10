import { TripDocument } from "src/modules/trip/trip.schema";
import { VehicleDocument } from "src/modules/vehicles/vehicles.schema";
import { ServiceType } from "src/share/enums";
import { TripCancelBy, TripStatus } from "src/share/enums/trip.enum";
import { Position, QueryOptions, StartOrEndPoint } from "src/share/interface";

export interface ICreateTripDto {
  customerId: string;
  driverId: string;
  timeStartEstimate: Date;
  timeEndEstimate: Date;
  vehicleId: string;
  scheduleId: string;
  serviceType: ServiceType;
  amount: number;
  isPrepaid?: boolean;
  isPayed?: boolean;
  code?: string;
  servicePayload:
  | BookingHourPayloadDto
  | BookingScenicRoutePayloadDto
  | BookingDestinationPayloadDto
  | BookingSharePayloadDto
  | BookingBusRoutePayloadDto;
}

export interface IUpdateTripDto {
  customerId?: string;
  driverId?: string;
  timeStartEstimate?: Date;
  timeEndEstimate?: Date;
  timeStart?: Date;
  timeEnd?: Date;
  vehicleId?: string;
  scheduleId?: string;
  tripCoordinates?: Position[];
  amount?: number;
  status?: TripStatus;
  isRating?: boolean;
  cancellationTime?: Date;
  cancellationReason?: string;
  cancelledBy?: TripCancelBy;
  refundAmount?: number;
  isPrepaid?: boolean;
  isPayed?: boolean;
  statusHistory?: Array<{
    status: TripStatus;
    changedAt: Date;
  }>;
}



export class BookingHourPayloadDto {
  bookingHour: {
    totalTime: number;
    startPoint: StartOrEndPoint;
  }

}
export class BookingScenicRoutePayloadDto {
  bookingScenicRoute: {
    routeId: string;
    startPoint: StartOrEndPoint;
    distanceEstimate: number;
    distance: number
  }
}
export class BookingDestinationPayloadDto {
  bookingDestination: {
    startPoint: StartOrEndPoint;
    endPoint: StartOrEndPoint;
    distanceEstimate: number;
    distance: number
  }
}
export class BookingSharePayloadDto {
  bookingShare: {
    sharedItinerary: string;
    numberOfSeat: number;
    startPoint: StartOrEndPoint;
    endPoint: StartOrEndPoint;
    distanceEstimate: number;
    distance: number,
    // isSharedItineraryMain: boolean
  }
}

export class BookingBusRoutePayloadDto {
  bookingBusRoute: {
    routeId: string;
    fromStopId: string;
    toStopId: string;
    distanceEstimate: number;
    distance: number;
    numberOfSeat: number;
  };
}

export interface tripParams extends QueryOptions {
  customerPhone?: string;
  driverName?: string;
  vehicleName?: string;
  status?: TripStatus;
  serviceType?: ServiceType;
  code?: string;
  isPrepaid?: boolean;
  isPayed?: boolean;
}
