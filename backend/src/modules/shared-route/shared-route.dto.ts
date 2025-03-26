import { SharedRouteStatus, SharedRouteStopsType } from "src/share/enums/shared-route.enum";
import { StartOrEndPoint } from "src/share/interface";

export interface sharedRouteStop {
    order: number;
    pointType: SharedRouteStopsType;
    trip: string;
    point: StartOrEndPoint;
    isPass: boolean;
}

export interface searchSharedRouteDTO {
    startPoint: StartOrEndPoint;
    endPoint: StartOrEndPoint;
    distanceEstimate: number;
    numberOfSeats: number;
}


export interface ICreateSharedRouteDTO {
    driverId: string;
    vehicleId: string;
    scheduleId: string;
    stops?: sharedRouteStop[];
    // distanceEstimate: number;
    // durationEstimate: number;
}

export interface IUpdateSharedRouteDTO {
    driverId?: string;
    vehicleId?: string;
    scheduleId?: string;
    stops?: sharedRouteStop[];
    distanceEstimate?: number;
    // distanceActual?: number;
    // durationEstimate?: number;
    durationActual?: number;
    status?: SharedRouteStatus;
    statusHistory?: {
        status: SharedRouteStatus;
        changedAt: Date;
        reason?: string;
    }[];

}