import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BusTrackingDocument = HydratedDocument<BusTracking>;

@Schema({ _id: false })
class Location {
  @Prop({ required: true, type: Number })
  latitude: number;

  @Prop({ required: true, type: Number })
  longitude: number;

  @Prop({ required: true, type: Date, default: Date.now })
  timestamp: Date;
}

@Schema({ collection: 'BusTrackings', timestamps: true })
export class BusTracking {
  @Prop({ type: Types.ObjectId, ref: 'DriverBusSchedule', required: true })
  driverSchedule: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'BusTrip', required: true })
  busTrip: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Vehicle', required: true })
  vehicle: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'BusStop' })
  currentStop: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'BusStop' })
  nextStop: Types.ObjectId;

  @Prop({ type: Location, required: true })
  currentLocation: Location;

  @Prop({ type: [Location], default: [] })
  locationHistory: Location[];

  @Prop({ type: Number })
  speed: number; // km/h

  @Prop({ type: Number })
  heading: number; // degrees

  @Prop({ type: Number, default: 0 })
  delayTime: number; // minutes

  @Prop({ type: Date })
  estimatedArrival: Date;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const BusTrackingSchema = SchemaFactory.createForClass(BusTracking);
