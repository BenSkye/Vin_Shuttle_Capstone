import { CanActivate, ExecutionContext, Inject } from "@nestjs/common";
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
        if (!token) {
            return false;
        }
        token = token.split(' ')[1];
        const decodeInformation = await this.tokenProvider.decodeToken(token);
        const keystore = await this.keyTokenService.findByUserId(decodeInformation._id);
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
