import { Injectable } from "@nestjs/common";
import { ITokenProvider, tokenDTO, TokenPayload } from "src/share/interface";
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtTokenService implements ITokenProvider {
    private readonly expiresInAccessToken: string | number;
    private readonly expiresInRefreshToken: string | number;

    constructor(expiresInAccessToken: string | number, expiresInRefreshToken: string | number) {
        this.expiresInAccessToken = expiresInAccessToken;
        this.expiresInRefreshToken = expiresInRefreshToken;
    }

    async generateTokenPair(payload: TokenPayload, publicKey: string, privateKey: string): Promise<tokenDTO> {
        try {
            const accessToken = jwt.sign(payload, publicKey,
                { expiresIn: this.expiresInAccessToken });
            const refreshToken = jwt.sign(payload, privateKey,
                { expiresIn: this.expiresInRefreshToken });

            jwt.verify(accessToken, publicKey, (err: any, decoded: any) => {
                if (err) {
                    console.error('error::', err)
                } else {
                    console.log('decoded::', decoded)
                }
            })
            console.log('publicKey', publicKey);

            return { accessToken, refreshToken }
        } catch (error) {
            return error;
        }
    }

    async verifyToken(token: string, key: string): Promise<any> {
        try {
            console.log('key', key);
            const decode = jwt.verify(token, key) as TokenPayload;
            return decode;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
}