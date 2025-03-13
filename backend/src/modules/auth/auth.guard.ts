import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
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
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    console.log('request', request.headers);
    // const userId = request.headers[HEADER.CLIENT_ID];
    // if (!userId) {
    //     return false;
    // }
    const authorization = request.headers[HEADER.AUTHORIZATION];
    if (!authorization) {
      return false;
    }
    const token = authorization.split(' ')[1];
    console.log('token26', token)
    const decodeInformation = await this.tokenProvider.decodeToken(token);
    console.log('decodeInformation28', decodeInformation);
    const keystore = await this.keyTokenService.findByUserId(decodeInformation._id);
    if (!keystore) {
      return false;
    }
    console.log('keystore33', keystore);

    const decode = await this.tokenProvider.verifyToken(token, keystore.publicKey);
    console.log('decode31', decode);
    if (!decode) {
      return false;
    }
    request.user = decode;
    return true;
  }
}
