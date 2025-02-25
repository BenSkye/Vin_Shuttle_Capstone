import { Module, Provider } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OTPSchema } from 'src/modules/OTP/otp.schema';
import { OTPController } from 'src/modules/OTP/otp.controller';
import { OTP_REPOSITORY, OTP_SERVICE } from 'src/modules/OTP/otp.di-token';
import { OTPService } from 'src/modules/OTP/otp.service';
import { OTPRepository } from 'src/modules/OTP/otp.repo';
import { KeytokenModule } from 'src/modules/keytoken/keytoken.module';
import { ShareModule } from 'src/share/share.module';

const dependencies: Provider[] = [
  { provide: OTP_REPOSITORY, useClass: OTPRepository },
  { provide: OTP_SERVICE, useClass: OTPService },
];

// export const tokenJWTProvider = new JwtTokenService('2d', '7d');
// const tokenProvider: Provider = { provide: TOKEN_PROVIDER, useValue: tokenJWTProvider };

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'OTP', schema: OTPSchema }]),
    KeytokenModule,
    ShareModule,
  ],
  controllers: [OTPController],
  providers: [...dependencies],
  exports: [...dependencies],
})
export class OtpModule {}
