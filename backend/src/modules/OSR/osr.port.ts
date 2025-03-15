import { sharedRouteStop } from "src/modules/shared-route/shared-route.dto";

export interface IRoutingOSRMService {
    getRoute(stop: sharedRouteStop[], vehicleId: string): Promise<
        {
            sharedRouteStop: sharedRouteStop[],
            durationToNewTripStart: number,
            durationToNewTripEnd: number,
            distanceToNewTripStart: number,
            distanceToNewTripEnd: number,
            distance: number
        }>;
}
