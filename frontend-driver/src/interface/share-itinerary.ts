import { SharedItineraryStopsType } from "~/constants/shared-itinerary.enum";
import { Position } from "~/interface/trip";

export interface StartOrEndPoint {
    position: Position;
    address: string;
}

export interface sharedItineraryStop {
    order: number;
    pointType: SharedItineraryStopsType;
    trip: string;
    tripCode: string;
    point: StartOrEndPoint;
    isPass: boolean;
}

export interface SharedItinerary {
    _id: string;
    driverId: string;
    vehicleId: string;
    scheduleId: string;
    stops: sharedItineraryStop[];
    createdAt: Date;
    updatedAt: Date;
}