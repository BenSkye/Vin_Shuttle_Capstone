import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';
import { IRedisService } from './interface';
import { REDIS_CLIENT } from 'src/share/di-token';

@Injectable()
export class RedisService implements IRedisService {
    constructor(
        @Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType
    ) { }

    async set(key: string, value: string, ttl?: number): Promise<void> {
        await this.redisClient.set(key, value);
        if (ttl) {
            await this.redisClient.expire(key, ttl);
        }
    }

    async get(key: string): Promise<string | null> {
        return this.redisClient.get(key);
    }

    async del(key: string): Promise<void> {
        await this.redisClient.del(key);
    }
}