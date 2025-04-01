import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { KEYTOKEN_SERVICE } from 'src/modules/keytoken/keytoken.di-token';
import { IKeyTokenService } from 'src/modules/keytoken/keytoken.port';
import { TOKEN_PROVIDER } from 'src/share/di-token';
import { HEADER } from 'src/share/interface';
import { ITokenProvider } from 'src/share/share.port';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(TOKEN_PROVIDER) private readonly tokenProvider: ITokenProvider,
    @Inject(KEYTOKEN_SERVICE) private readonly keyTokenService: IKeyTokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    console.log('request', request.headers);

    const authorization = request.headers[HEADER.AUTHORIZATION];
    const clientId = request.headers[HEADER.CLIENT_ID];
    if (!authorization || !clientId) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Invalid login session',
          vnMessage: 'Phiên đăng nhập không hợp lệ',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const token = authorization.split(' ')[1];
    //if access token is expired
    const keystore = await this.keyTokenService.findByUserId(clientId);
    if (!keystore) {
      return false;
    }
    console.log('keystore', keystore);
    const decode = await this.tokenProvider.verifyToken(token, keystore.publicKey);
    if (!decode) {
      return false;
    }
    request.user = decode;
    return true;
  }
}
