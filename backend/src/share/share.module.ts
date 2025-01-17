import { Module, Provider } from "@nestjs/common";
import { TOKEN_PROVIDER } from "src/share/di-token";
import { JwtTokenService } from "src/share/jwt";


export const tokenJWTProvider = new JwtTokenService('2d', '7d');
const tokenProvider: Provider = { provide: TOKEN_PROVIDER, useValue: tokenJWTProvider };


@Module({
    providers: [tokenProvider],
    exports: [tokenProvider],
    imports: [
    ]
})

export class ShareModule { }
