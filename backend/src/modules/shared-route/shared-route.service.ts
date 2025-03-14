import { Inject } from "@nestjs/common";
import { sharedRouteStop } from "src/modules/shared-route/shared-route.dto";
import { ISharedRouteService } from "src/modules/shared-route/shared-route.port";
import { TRACKING_SERVICE } from "src/modules/tracking/tracking.di-token";
import { ITrackingService } from "src/modules/tracking/tracking.port";

export class SharedRouteService implements ISharedRouteService {
    constructor(
        @Inject(TRACKING_SERVICE)
        private readonly trackingService: ITrackingService
    ) { }

    async findBestOrderStop(sharedRouteStops: sharedRouteStop[], vehicleId: string): Promise<sharedRouteStop[]> {
        const lastVehiclePosition = await this.trackingService.getLastVehicleLocation(vehicleId);
        const vehicleStop = {
            lat: lastVehiclePosition.latitude,
            lng: lastVehiclePosition.longitude
        };
        const bestOrder = []

        return bestOrder;
    }
}