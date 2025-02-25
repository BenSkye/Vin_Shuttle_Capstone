import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Message } from '../interfaces/message.interface';

@Schema({ timestamps: true })
export class Chat extends Document {
  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ type: String, required: true })
  roomId: string;

  @Prop([{ type: Types.ObjectId, ref: 'User' }])
  participants: string[];

  @Prop({ type: Types.ObjectId, ref: 'Booking' })
  bookingId?: string;

  @Prop({
    type: {
      senderId: { type: Types.ObjectId, ref: 'User' },
      receiverId: { type: Types.ObjectId, ref: 'User' },
      content: String,
      timestamp: Date,
      isRead: Boolean,
    },
  })
  lastMessage?: Message;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
