import { tripAmount } from "src/modules/OSR/osr.dto";
import { sharedRouteStop } from "src/modules/shared-route/shared-route.dto";
import { Position } from "src/share/interface";

export interface IRoutingOSRMService {
    getRoute(
        stop: sharedRouteStop[],
        vehicleId: string,
        vehicleCapacity: number,
        listTripsAmount: tripAmount[]
    ): Promise<
        {
            sharedRouteStop: sharedRouteStop[],
            durationToNewTripStart: number,
            durationToNewTripEnd: number,
            distanceToNewTripStart: number,
            distanceToNewTripEnd: number,
            distance: number,
            perTripDistanceAfterChange: {
                tripId: string,
                distance: number
            }[]
        }>;

    getDistanceBetweenTwoPoints(startPoint: Position, endPoint: Position): Promise<number>
}
