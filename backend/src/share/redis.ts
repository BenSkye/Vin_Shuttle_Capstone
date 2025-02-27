import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { IRedisService } from './interface';
import { REDIS_CLIENT } from 'src/share/di-token';

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

    async setUserSocket(userId: string, socketId: string): Promise<void> {
        const pipeline = this.redisClient.pipeline();
        pipeline.set(`user:${userId}`, socketId, 'EX', 86400);
        pipeline.set(`socket:${socketId}`, userId, 'EX', 86400);
        await pipeline.exec();
    }

    async deleteUserSocket(socketId: string): Promise<void> {
        const userId = await this.redisClient.get(`socket:${socketId}`);
        const pipeline = this.redisClient.pipeline();

        if (userId) {
            pipeline.del(`user:${userId}`);
        }
        pipeline.del(`socket:${socketId}`);

        await pipeline.exec();
    }

    async getUserSocket(userId: string): Promise<string | null> {
        return this.redisClient.get(`user:${userId}`);
    }
}