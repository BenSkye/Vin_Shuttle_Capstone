import { sharedRouteStop } from "src/modules/shared-route/shared-route.dto";

export interface ISharedRouteService {
    findBestOrderStop(sharedRouteStops: sharedRouteStop[], vehicleId: string): Promise<any>;

}