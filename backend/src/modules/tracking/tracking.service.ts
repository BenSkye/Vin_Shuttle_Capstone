import { Inject, Injectable } from "@nestjs/common";
import Redis from "ioredis";
import { ITrackingService } from "src/modules/tracking/tracking.port";
import { REDIS_CLIENT } from "src/share/di-token";
import { LocationData } from "src/share/interface";

@Injectable()
export class TrackingService implements ITrackingService {
    constructor(
        @Inject(REDIS_CLIENT) private readonly redisClient: Redis
    ) { }

    async updateLastVehicleLocation(vehicleId: string, location: LocationData) {
        await this.redisClient.set(`lastLocation_${vehicleId}`, JSON.stringify(location));
    }

    async getLastVehicleLocation(vehicleId: string): Promise<LocationData> {
        const location = await this.redisClient.get(`lastLocation_${vehicleId}`);
        return JSON.parse(location);
    }
}