import { CheckoutResponseDataType } from '@payos/node/lib/type';
import { tokenDTO, TokenPayload } from 'src/share/interface';

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
  sendSmsWithoutBrandname(phone: string, content: string): Promise<any>;
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

export interface IMomoService {
  createPaymentLink(createPaymentDto: {
    bookingCode: number;
    amount: number;
    description: string;
    cancelUrl: string;
    returnUrl: string;
  }): Promise<any>;
  createTransferTripPaymentLink(createPaymentDto: {
    bookingCode: number;
    amount: number;
    tripIds: string[];
    description: string;
    returnUrl: string;
  }): Promise<any>;

  initiateRefund(createRefundDto: {
    orderId: string;
    amount: number;
    description: string;
    transId: string;
  }): Promise<any>;
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
