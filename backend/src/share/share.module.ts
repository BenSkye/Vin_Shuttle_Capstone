import { Module, Provider } from '@nestjs/common';
import {
  MOMO_PROVIDER,
  PAYOS_PROVIDER,
  REDIS_CLIENT,
  REDIS_PROVIDER,
  SMS_PROVIDER,
  TOKEN_PROVIDER,
} from 'src/share/di-token';
import { JwtTokenService } from 'src/share/jwt';
import { PayosService } from 'src/share/payos';
import { RedisService } from 'src/share/redis';
import { SmsService } from 'src/share/sms';
import { Redis } from 'ioredis';
import { HttpModule } from '@nestjs/axios';
import { MomoService } from 'src/share/momo';

export const tokenJWTProvider = new JwtTokenService('2d', '7d'); //set accesstoken 2 minutes and refreshtoken 7 days
const tokenProvider: Provider = { provide: TOKEN_PROVIDER, useValue: tokenJWTProvider };

const dependencies = [
  tokenProvider,
  {
    provide: SMS_PROVIDER,
    useClass: SmsService,
  },
  {
    provide: PAYOS_PROVIDER,
    useClass: PayosService,
  },
  {
    provide: MOMO_PROVIDER,
    useClass: MomoService,
  },
  {
    provide: REDIS_CLIENT,
    useFactory: () => {
      const redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        retryStrategy: times => Math.min(times * 50, 2000),
        reconnectOnError: err => {
          const targetErrors = [/READONLY/, /ETIMEDOUT/];
          return targetErrors.some(pattern => pattern.test(err.message));
        },
      });

      // Thêm event listeners
      redis
        .on('connect', () => console.log('Connecting to Redis...'))
        .on('ready', () => console.log('✅ Redis connection established'))
        .on('error', e => console.error('❌ Redis connection error:', e))
        .on('reconnecting', () => console.log('Reconnecting to Redis...'))
        .on('end', () => console.log('Redis connection closed'));

      return redis;
    },
  },
  {
    provide: REDIS_PROVIDER,
    useClass: RedisService,
  },
];

@Module({
  providers: [...dependencies],
  exports: [...dependencies],
  imports: [HttpModule],
})
export class ShareModule {}
