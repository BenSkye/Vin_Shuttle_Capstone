import { CheckoutResponseDataType } from '@payos/node/lib/type';

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

export interface StartPoint {
  position: Position;
  address: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  timestamp?: number;
}

export interface TrackingData {
  vehicleId: string;
  location: LocationData;
}

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
  getUserSocket(namespace: string, userId: string): Promise<string[]>;
  setUserTrackingVehicle(userId: string, vehicleId: string): Promise<void>;
  deleteUserTrackingVehicle(userId: string, vehicleId: string): Promise<void>;
  getListUserTrackingVehicle(vehicleId: string): Promise<string[]>;
}

export const HEADER = {
  CLIENT_ID: 'x-client-id',
  AUTHORIZATION: 'authorization',
  REFRESH_TOKEN: 'x-refresh-token',
};
