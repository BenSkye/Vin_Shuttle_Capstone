// filepath: c:\Users\Admin\Desktop\FOR STUDY\SEP\Vin_Shuttle_Capstone\backend\src\modules\conversation\conversation.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ConversationStatus } from 'src/share/enums/conversation.enum';

export type ConversationDocument = HydratedDocument<Conversation>;

@Schema({ collection: 'Conversations', timestamps: true })
export class Conversation {
  @Prop({ type: Types.ObjectId, ref: 'Trip', required: true })
  tripId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  customerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  driverId: Types.ObjectId;

  @Prop({
    type: [
      {
        _id: false,
        senderId: { type: Types.ObjectId, ref: 'User' },
        content: String,
        timestamp: Date,
      },
    ],
    default: [],
  })
  listMessage: [
    {
      senderId: { type: Types.ObjectId; ref: 'User' };
      content: string;
      timestamp: Date;
    },
  ];

  @Prop({
    type: {
      _id: false,
      senderId: { type: Types.ObjectId, ref: 'User' },
      content: String,
      timestamp: Date,
    },
    default: null,
  })
  lastMessage: {
    senderId: { type: Types.ObjectId; ref: 'User' };
    content: string;
    timestamp: Date;
  };

  @Prop({ type: Date, required: true })
  timeToOpen: Date;

  @Prop({ type: Date, required: true })
  timeToClose: Date;

  @Prop({
    type: String,
    enum: ConversationStatus,
    default: ConversationStatus.PENDING,
  })
  status: ConversationStatus;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
