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
}