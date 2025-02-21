import { ServiceType } from "src/share/enums";
import { TripStatus } from "src/share/enums/trip.enum";
import { Position } from "src/share/interface";

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
        reason?: string;
    }>;
}

class BaseServicePayloadDto {
}
export class BookingHourPayloadDto extends BaseServicePayloadDto {
    totalTime: number;
    startPoint: Position;
}

export class BookingScenicRoutePayloadDto extends BaseServicePayloadDto {
    routeId: string;
    startPoint: Position;
    distanceEstimate: number;
    distance: number
}

export class BookingDestinationPayloadDto extends BaseServicePayloadDto {
    startPoint: Position;
    endPoint: Position;
    distanceEstimate: number;
    distance: number
}

export class BookingSharePayloadDto extends BaseServicePayloadDto {
    numberOfSeat: number;
    startPoint: Position;
    endPoint: Position;
    distanceEstimate: number;
    distance: number
}


