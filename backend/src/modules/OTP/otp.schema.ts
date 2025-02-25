import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Schema as MongooseSchema } from 'mongoose';

// tự động xóa sau 20s
@Schema({ collection: 'OTP' })
export class OTP {
  @Prop({ required: true, ref: 'User' })
  user: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  code: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  token: {
    accessToken: string;
    refreshToken: string;
  };

  @Prop({
    default: () => new Date(),
    expires: 120,
  })
  expiresAt: Date;
}

export const OTPSchema = SchemaFactory.createForClass(OTP);
