import { ServiceType } from "src/share/enums";
import { TripStatus } from "src/share/enums/trip.enum";
import { Position, StartPoint } from "src/share/interface";

export interface ICreateTripDto {
    customerId: string;
    driverId: string;
    timeStartEstimate: Date;
    timeEndEstimate: Date;
    vehicleId: string;
    scheduleId: string;
    serviceType: ServiceType;
    amount: number;
    servicePayload:
    | BookingHourPayloadDto
    | BookingScenicRoutePayloadDto
    | BookingDestinationPayloadDto
    | BookingSharePayloadDto;
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
    tripCoordinates?: Position[]
    amount?: number;
    status?: TripStatus;
    cancellationTime?: Date;
    cancellationReason?: string;
    refundAmount?: number;
    statusHistory?: Array<{
        status: TripStatus;
        changedAt: Date;
    }>;
}



export class BookingHourPayloadDto {
    bookingHour: {
        totalTime: number;
        startPoint: StartPoint;
    }

}

export class BookingScenicRoutePayloadDto {
    bookingScenicRoute: {
        routeId: string;
        startPoint: StartPoint;
        distanceEstimate: number;
        distance: number
    }
}

export class BookingDestinationPayloadDto {
    bookingDestination: {
        startPoint: StartPoint;
        endPoint: StartPoint;
        distanceEstimate: number;
        distance: number
    }
}

export class BookingSharePayloadDto {
    bookingShare: {
        numberOfSeat: number;
        startPoint: StartPoint;
        endPoint: StartPoint;
        distanceEstimate: number;
        distance: number
    }
}


