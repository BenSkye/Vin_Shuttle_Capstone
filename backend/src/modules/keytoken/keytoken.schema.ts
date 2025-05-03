import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type KeyTokenDocument = HydratedDocument<KeyToken>;

@Schema({ collection: 'KeyTokens' })
export class KeyToken {
  @Prop({ required: true, ref: 'User' })
  user: mongoose.Schema.Types.ObjectId;

  // @Prop({ required: true })
  // privateKey: string;

  @Prop({ required: true })
  publicKey: string;

  @Prop({ default: [] })
  refreshTokenUsed: Array<string>;

  @Prop({ required: true })
  refreshToken: string;

  @Prop()
  resetPublicKey?: string;

  @Prop()
  resetPrivateKey?: string;
}

export const KeyTokenSchema = SchemaFactory.createForClass(KeyToken);
