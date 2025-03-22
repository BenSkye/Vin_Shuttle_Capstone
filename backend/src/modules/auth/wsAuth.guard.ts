import { CanActivate, ExecutionContext, HttpException, HttpStatus, Inject } from "@nestjs/common";
import { KEYTOKEN_SERVICE } from "src/modules/keytoken/keytoken.di-token";
import { IKeyTokenService } from "src/modules/keytoken/keytoken.port";
import { TOKEN_PROVIDER } from "src/share/di-token";
import { HEADER, } from "src/share/interface";
import { ITokenProvider } from "src/share/share.port";

export class WsAuthGuard implements CanActivate {
    constructor(
        @Inject(TOKEN_PROVIDER) private readonly tokenProvider: ITokenProvider,
        @Inject(KEYTOKEN_SERVICE) private readonly keyTokenService: IKeyTokenService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client = context.switchToWs().getClient();
        let token = client.handshake.auth[HEADER.AUTHORIZATION];
        let clientId = client.handshake.auth[HEADER.CLIENT_ID];
        if (!token || !clientId) {
            throw new HttpException(
                {
                    statusCode: HttpStatus.UNAUTHORIZED,
                    message: 'Invalid login session',
                    vnMessage: 'Phiên đăng nhập không hợp lệ',
                },
                HttpStatus.UNAUTHORIZED
            )
        }
        token = token.split(' ')[1];
        const keystore = await this.keyTokenService.findByUserId(clientId);
        if (!keystore) {
            return false;
        }
        const decode = await this.tokenProvider.verifyToken(token, keystore.publicKey);
        if (!decode) {
            return false;
        }
        client.user = decode;
        return true;
    }
}
