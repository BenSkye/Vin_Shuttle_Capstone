import { CheckoutResponseDataType } from "@payos/node/lib/type";
import { sharedItineraryStop } from "src/modules/shared-itinerary/shared-itinerary.dto";
import { tokenDTO, TokenPayload } from "src/share/interface";

export interface ITokenProvider {
    generateTokenPair(
        payload: TokenPayload,
        publicKey: string,
        privateKey: string,
    ): Promise<tokenDTO>;
    verifyToken(token: string, key: string): Promise<TokenPayload | null>;
    decodeToken(token: string): Promise<any>;
}

export interface ISMSProvider {
    sendSms(phone: string, content: string): Promise<any>;
}


export interface IPayosService {
    createPaymentLink(createPaymentDto: {
        bookingCode: number;
        amount: number;
        description: string;
        cancelUrl: string;
        returnUrl: string;
    }): Promise<CheckoutResponseDataType>;
}

export interface IRedisService {
    set(key: string, value: string, ttl?: number): Promise<void>;
    get(key: string): Promise<string | null>;
    del(key: string): Promise<void>;
    setUserSocket(namespace: string, userId: string, socketId: string): Promise<void>;
    deleteUserSocket(namespace: string, socketId: string): Promise<void>;
    getUserSockets(namespace: string, userId: string): Promise<string[]>;
    setUserTrackingVehicle(userId: string, vehicleId: string): Promise<void>;
    deleteUserTrackingVehicle(userId: string, vehicleId: string): Promise<void>;
    getVehicleSubscribers(vehicleId: string): Promise<string[]>;
}