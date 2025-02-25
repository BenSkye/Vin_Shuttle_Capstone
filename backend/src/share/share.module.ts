import { Module, Provider } from '@nestjs/common';
import { PAYOS_PROVIDER, SMS_PROVIDER, TOKEN_PROVIDER } from 'src/share/di-token';
import { JwtTokenService } from 'src/share/jwt';
import { PayosService } from 'src/share/payos';
import { SmsService } from 'src/share/sms';

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
];

@Module({
  providers: [...dependencies],
  exports: [...dependencies],
  imports: [],
})
export class ShareModule {}
