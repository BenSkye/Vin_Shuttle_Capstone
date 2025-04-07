import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { ITrackingService } from 'src/modules/tracking/tracking.port';
import { REDIS_CLIENT } from 'src/share/di-token';
import { SOCKET_NAMESPACE } from 'src/share/enums/socket.enum';
import { LocationData } from 'src/share/interface';

@Injectable()
export class TrackingService implements ITrackingService {
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) { }

  async updateLastVehicleLocation(vehicleId: string, location: LocationData) {
    const key = `lastLocation:${vehicleId}`;
    await this.redisClient.set(key, JSON.stringify(location), 'EX', 86400);
  }

  async getLastVehicleLocation(vehicleId: string): Promise<LocationData> {
    console.log('vehicleId', vehicleId);
    const key = `lastLocation:${vehicleId}`;
    const location = await this.redisClient.get(key);
    return JSON.parse(location);
  }

  async deleteLastVehicleLocation(vehicleId: string) {
    const key = `lastLocation:${vehicleId}`;
    await this.redisClient.del(key);
  }

  async setUserTrackingVehicle(userId: string, vehicleId: string): Promise<void> {
    const vehicleUsersKey = `vehicleSubscribers${SOCKET_NAMESPACE.TRACKING}:${vehicleId}`;
    await this.redisClient.sadd(vehicleUsersKey, userId);
    await this.redisClient.expire(vehicleUsersKey, 86400);
  }

  async deleteUserTrackingVehicle(userId: string, vehicleId: string): Promise<void> {
    const vehicleUsersKey = `vehicleSubscribers${SOCKET_NAMESPACE.TRACKING}:${vehicleId}`;
    await this.redisClient.srem(vehicleUsersKey, userId);
  }

  async getVehicleSubscribers(vehicleId: string): Promise<string[]> {
    const vehicleUsersKey = `vehicleSubscribers${SOCKET_NAMESPACE.TRACKING}:${vehicleId}`;
    return this.redisClient.smembers(vehicleUsersKey);
  }
}
