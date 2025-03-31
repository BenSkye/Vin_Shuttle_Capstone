import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from 'src/share/di-token';
import { SOCKET_NAMESPACE } from 'src/share/enums/socket.enum';
import { IRedisService } from 'src/share/share.port';

@Injectable()
export class RedisService implements IRedisService {
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redisClient.set(key, value, 'EX', ttl);
    } else {
      await this.redisClient.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async setUserSocket(namespace: string, userId: string, socketId: string): Promise<void> {
    const userSocketsKey = `userSockets:${namespace}:${userId}`;
    await this.redisClient.sadd(userSocketsKey, socketId);
    await this.redisClient.expire(userSocketsKey, 86400);
  }

  async deleteUserSocket(namespace: string, socketId: string): Promise<void> {
    // Tìm tất cả user keys chứa socketId này
    const keys = await this.redisClient.keys(`userSockets:${namespace}:*`);

    const pipeline = this.redisClient.pipeline();
    for (const key of keys) {
      pipeline.srem(key, socketId);
    }
    await pipeline.exec();
  }

  async getUserSockets(namespace: string, userId: string): Promise<string[]> {
    const userSocketsKey = `userSockets:${namespace}:${userId}`;
    return this.redisClient.smembers(userSocketsKey);
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
