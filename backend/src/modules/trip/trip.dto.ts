import { ServiceType } from "src/share/enums";
import { TripStatus } from "src/share/enums/trip.enum";

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
    amount?: number;
    status?: TripStatus
}

class BaseServicePayloadDto {
}
export class BookingHourPayloadDto extends BaseServicePayloadDto {
    totalTime: number;
    startPoint: string;
}

export class BookingScenicRoutePayloadDto extends BaseServicePayloadDto {
    routeId: string;
    startPoint: string;
    distanceEstimate: number;
    distance: number
}

export class BookingDestinationPayloadDto extends BaseServicePayloadDto {
    startPoint: string;
    endPoint: string;
    distanceEstimate: number;
    distance: number
}

export class BookingSharePayloadDto extends BaseServicePayloadDto {
    numberOfSeat: number;
    startPoint: string;
    endPoint: string;
    distanceEstimate: number;
    distance: number
}


