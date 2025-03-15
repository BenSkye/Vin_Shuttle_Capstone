import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from 'src/share/di-token';
import { SOCKET_NAMESPACE } from 'src/share/enums/socket.enum';
import { IRedisService } from 'src/share/share.port';

@Injectable()
export class RedisService implements IRedisService {
    constructor(
        @Inject(REDIS_CLIENT) private readonly redisClient: Redis
    ) { }

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
        const pipeline = this.redisClient.pipeline();
        const socketIds = await this.redisClient.smembers(`${namespace}-${userId}`);
        pipeline.set(`${namespace}-${socketId}`, userId, 'EX', 86400);
        if (socketIds.includes(socketId)) return;
        pipeline.sadd(`${namespace}-${userId}`, socketId);
        await pipeline.exec();
    }

    async deleteUserSocket(namespace: string, socketId: string): Promise<void> {
        const userId = await this.redisClient.get(`${namespace}-${socketId}`);
        console.log('userIdDelete', userId)
        console.log('socketIdDelete', socketId)
        const pipeline = this.redisClient.pipeline();
        pipeline.srem(`${namespace}-${userId}`, socketId);
        pipeline.del(`${namespace}-${socketId}`);
        await pipeline.exec();
    }

    async getUserSocket(namespace: string, userId: string): Promise<string[]> {
        return this.redisClient.smembers(`${namespace}-${userId}`);
    }

    async setUserTrackingVehicle(userId: string, vehicleId: string): Promise<void> {
        const namespace = SOCKET_NAMESPACE.TRACKING;
        const pipeline = this.redisClient.pipeline();
        const vehicleIds = await this.redisClient.smembers(`${namespace}-${vehicleId}`);
        if (vehicleIds.includes(userId)) return;
        pipeline.sadd(`${namespace}-${vehicleId}`, userId);
        pipeline.expire(`${namespace}-${vehicleId}`, 86400);
        await pipeline.exec();
    }

    async deleteUserTrackingVehicle(userId: string, vehicleId: string): Promise<void> {
        const namespace = SOCKET_NAMESPACE.TRACKING;
        const pipeline = this.redisClient.pipeline();
        pipeline.srem(`${namespace}-${vehicleId}`, userId);
        await pipeline.exec();
    }

    async getListUserTrackingVehicle(vehicleId: string): Promise<string[]> {
        const namespace = SOCKET_NAMESPACE.TRACKING;
        return this.redisClient.smembers(`${namespace}-${vehicleId}`);
    }


}