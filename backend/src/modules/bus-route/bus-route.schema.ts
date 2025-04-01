import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Position, PositionSchema } from 'src/share/share.schema';

export type BusRouteDocument = HydratedDocument<BusRoute>;



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

  @Prop({ required: true, type: [PositionSchema] })
  routeCoordinates: Position[];

  @Prop({ required: true, type: Number })
  totalDistance: number; // Tổng khoảng cách (km)

  @Prop({ required: true, type: Number })
  estimatedDuration: number; // Tổng thời gian (phút)

  @Prop({ type: Types.ObjectId, ref: 'VehicleCategory' })
  vehicleCategory: Types.ObjectId;

  @Prop({ required: true, type: String, enum: ['active', 'inactive'], default: 'active' })
  status: string;

  @Prop({ type: Date })
  starTime: Date; // Ngày bắt đầu áp dụng

  @Prop({ type: Date })
  endTime: Date; // Ngày kết thúc áp dụng

  // @Prop({ type: Number, required: true })
  // basePrice: number;

  @Prop({ type: Types.ObjectId, ref: 'VehiclePricing', required: true })
  pricingConfig: Types.ObjectId;
}

export const BusRouteSchema = SchemaFactory.createForClass(BusRoute);
