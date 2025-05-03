import { Module, Provider } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from 'src/modules/auth/auth.controller';
import {
  AUTH_GUARD,
  AUTH_SERVICE,
  ROLE_GUARD,
  WS_AUTH_GUARD,
} from 'src/modules/auth/auth.di-token';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthService } from 'src/modules/auth/auth.service';
import { RolesGuard } from 'src/modules/auth/role.guard';
import { WsAuthGuard } from 'src/modules/auth/wsAuth.guard';
import { KEYTOKEN_SERVICE } from 'src/modules/keytoken/keytoken.di-token';
import { KeytokenModule } from 'src/modules/keytoken/keytoken.module';
import { KeyTokenService } from 'src/modules/keytoken/keytoken.service';
import { OtpModule } from 'src/modules/OTP/otp.module';
import { UsersModule } from 'src/modules/users/users.module';
import { ShareModule } from 'src/share/share.module';

const dependencies: Provider[] = [
  {
    provide: KEYTOKEN_SERVICE,
    useClass: KeyTokenService,
  },
  {
    provide: AUTH_GUARD,
    useClass: AuthGuard,
  },
  {
    provide: AUTH_SERVICE,
    useClass: AuthService,
  },
  {
    provide: ROLE_GUARD,
    useClass: RolesGuard,
  },
  {
    provide: WS_AUTH_GUARD,
    useClass: WsAuthGuard,
  },
];

// const tokenProvider: Provider = { provide: TOKEN_PROVIDER, useValue: tokenJWTProvider };
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '10m' },
    }),
    KeytokenModule,
    ShareModule,
    OtpModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [...dependencies],
  exports: [AUTH_GUARD, AUTH_SERVICE, WS_AUTH_GUARD],
})
export class AuthModule { }
