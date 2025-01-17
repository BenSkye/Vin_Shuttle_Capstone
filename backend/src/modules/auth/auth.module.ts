import { Module, Provider } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AUTH_GUARD } from 'src/modules/auth/auth.di-token';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { KEYTOKEN_SERVICE } from 'src/modules/keytoken/keytoken.di-token';
import { KeytokenModule } from 'src/modules/keytoken/keytoken.module';
import { KeyTokenService } from 'src/modules/keytoken/keytoken.service';


const dependencies: Provider[] = [
    {
        provide: KEYTOKEN_SERVICE, useClass: KeyTokenService,
    },
    {
        provide: AUTH_GUARD, useClass: AuthGuard,
    },
]

// const tokenProvider: Provider = { provide: TOKEN_PROVIDER, useValue: tokenJWTProvider };
@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '10m' },
        }),
        KeytokenModule,
    ],
    controllers: [],
    providers: [...dependencies],
    exports: [AUTH_GUARD],
})
export class AuthModule { }