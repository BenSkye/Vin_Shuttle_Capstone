import { Module, Provider } from '@nestjs/common';
import { PAYOS_PROVIDER, REDIS_CLIENT, REDIS_PROVIDER, SMS_PROVIDER, TOKEN_PROVIDER } from 'src/share/di-token';
import { JwtTokenService } from 'src/share/jwt';
import { PayosService } from 'src/share/payos';
import { RedisService } from 'src/share/redis';
import { SmsService } from 'src/share/sms';
import { createClient } from 'redis';

export const tokenJWTProvider = new JwtTokenService('2d', '7d');
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
    provide: REDIS_CLIENT,
    useFactory: async () => {
      const client = createClient({
        socket: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT) || 6379
        },
        password: process.env.REDIS_PASSWORD || undefined,
      });

      // Thêm event listeners để log trạng thái kết nối
      client
        .on('connect', () => console.log('Connecting to Redis...'))
        .on('ready', () => console.log('✅ Redis connection established '))
        .on('error', (e) => console.error('❌ Redis connection error:', e))
        .on('reconnecting', () => console.log('Reconnecting to Redis...'))
        .on('end', () => console.log('Redis connection closed'));

      try {
        await client.connect();
        return client;
      } catch (error) {
        console.error('Failed to connect to Redis:', error);
        throw error;
      }
    }
  },
  {
    provide: REDIS_PROVIDER,
    useClass: RedisService,
  }
];

@Module({
  providers: [...dependencies],
  exports: [...dependencies],
  imports: [],
})
export class ShareModule { }
