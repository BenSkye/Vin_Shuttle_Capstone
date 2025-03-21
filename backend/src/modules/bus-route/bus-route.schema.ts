import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BusRouteDocument = HydratedDocument<BusRoute>;

@Schema({ _id: false })
class Position {
  @Prop({ required: true, type: Number })
  lat: number;

  @Prop({ required: true, type: Number })
  lng: number;
}

@Schema({ _id: false })
class RouteStop {
  @Prop({ type: Types.ObjectId, ref: 'BusStop', required: true })
  stopId: Types.ObjectId;

  @Prop({ required: true, type: Number })
  orderIndex: number;

  @Prop({ required: true, type: Number })
  distanceFromStart: number; // Khoảng cách từ điểm đầu (km)

  @Prop({ required: true, type: Number })
  estimatedTime: number; // Thời gian ước tính từ điểm đầu (phút)
}

@Schema({ collection: 'BusRoutes', timestamps: true })
export class BusRoute {
  @Prop({ required: true, type: String })
  name: string;

  @Prop({ type: String })
  description: string;

  @Prop({ required: true, type: [RouteStop] })
  stops: RouteStop[];

  @Prop({ required: true, type: [Position] })
  routeCoordinates: Position[];

  @Prop({ required: true, type: Number })
  totalDistance: number; // Tổng khoảng cách (km)

  @Prop({ required: true, type: Number })
  estimatedDuration: number; // Tổng thời gian (phút)

  @Prop({ type: Types.ObjectId, ref: 'VehicleCategory' })
  vehicleCategory: Types.ObjectId;

  @Prop({ required: true, type: String, enum: ['active', 'inactive'], default: 'active' })
  status: string;

  @Prop({ type: Number, required: true })
  basePrice: number;
}

export const BusRouteSchema = SchemaFactory.createForClass(BusRoute);
