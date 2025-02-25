import { CheckoutResponseDataType } from "@payos/node/lib/type";

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

export interface Position {
    lat: number;
    lng: number;
}

export interface ITokenProvider {
    generateTokenPair(payload: TokenPayload, publicKey: string, privateKey: string): Promise<tokenDTO>;
    verifyToken(token: string, key: string): Promise<TokenPayload | null>;
    decodeToken(token: string): Promise<any>
}

export interface ISMSProvider {
    sendOTP(phone: string, OTP: string): Promise<any>;
}

export interface IPayosService {
    createPaymentLink(createPaymentDto: {
        bookingCode: number;
        amount: number;
        description: string;
        cancelUrl: string;
        returnUrl: string;
    }): Promise<CheckoutResponseDataType>
}

export const HEADER = {
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization',
    REFRESH_TOKEN: 'x-refresh-token',
}