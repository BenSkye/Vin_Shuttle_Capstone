export interface tokenDTO {
    accessToken: string;
    refreshToken: string;
}


export interface TokenPayload {
    _id: string;
    name: string;
    role: string;
    phone: string;
}

export interface ITokenProvider {
    generateTokenPair(payload: TokenPayload, publicKey: string, privateKey: string): Promise<tokenDTO>;
    verifyToken(token: string, key: string): Promise<TokenPayload | null>;
}

export const HEADER = {
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization',
    REFRESH_TOKEN: 'x-refresh-token',
}