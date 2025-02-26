import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BusStopDocument = HydratedDocument<BusStop>;

@Schema({ _id: false })
class Position {
  @Prop({ required: true, type: Number })
  lat: number;

  @Prop({ required: true, type: Number })
  lng: number;
}

@Schema({ collection: 'BusStops', timestamps: true })
export class BusStop {
  @Prop({ required: true, type: String })
  name: string;

  @Prop({ type: String })
  description: string;

  @Prop({ required: true, type: Position })
  position: Position;

  @Prop({ required: true, type: String, enum: ['active', 'inactive'], default: 'active' })
  status: string;

  @Prop({ type: String })
  address: string;
}

export const BusStopSchema = SchemaFactory.createForClass(BusStop);
