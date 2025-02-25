import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IOTPRepository, OTPCreateDTO } from 'src/modules/OTP/otp.port';
import { OTP } from 'src/modules/OTP/otp.schema';

@Injectable()
export class OTPRepository implements IOTPRepository {
  constructor(@InjectModel(OTP.name) private readonly OTPModel: Model<OTP>) {}

  async insert(data: OTPCreateDTO): Promise<OTP> {
    const otp = new this.OTPModel(data);
    return otp.save();
  }

  async findOTPs(query: any): Promise<OTP[]> {
    const listOTP = await this.OTPModel.find(query);
    return listOTP;
  }

  async deleteOTPs(query: any): Promise<void> {
    await this.OTPModel.deleteMany(query);
  }
}
