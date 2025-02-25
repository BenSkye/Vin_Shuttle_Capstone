import { Types } from 'mongoose';
import { OTP } from 'src/modules/OTP/otp.schema';

export interface OTPCreateDTO {
  user: Types.ObjectId;
  phone: string;
  code: string;
  token: object;
}

export interface OTPPayload {
  phone: string;
  role: string;
  name: string;
  _id: string;
}

export interface OTPVerifyDTO {
  phone: string;
  code: string;
}

export interface IOTPRepository {
  insert(data: OTPCreateDTO): Promise<OTP>;
  findOTPs(query: any): Promise<OTP[]>;
  deleteOTPs(query: any): Promise<void>;
}

export interface IOTPService {
  create(data: OTPPayload): Promise<string>;
  verify(data: OTPVerifyDTO): Promise<object>;
}
