import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ScenicRouteStatus } from 'src/share/enums/scenic-routes.enum';
import { Position } from 'src/share/share.schema';

// @Schema({ _id: false })
// class Position {
//   @Prop({ required: true, type: Number })
//   lat: number;

//   @Prop({ required: true, type: Number })
//   lng: number;
// }

@Schema({ _id: false })
class Waypoint {
  @Prop({ required: true, type: Number })
  id: number;

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: Position })
  position: Position;

  @Prop({ type: String })
  description?: string;
}

export type ScenicRouteDocument = HydratedDocument<ScenicRoute>;

@Schema({ collection: 'ScenicRoutes', timestamps: true })
export class ScenicRoute {
  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: String })
  description: string;

  @Prop({ required: true, type: String, enum: ScenicRouteStatus, default: ScenicRouteStatus.DRAFT })
  status: string;

  @Prop({ required: true, type: [Waypoint] })
  waypoints: Waypoint[];

  @Prop({ required: true, type: [Position] })
  scenicRouteCoordinates: Position[];

  @Prop({ required: true, type: Number })
  estimatedDuration: number;

  @Prop({ required: true, type: Number })
  totalDistance: number;
}

export const ScenicRouteSchema = SchemaFactory.createForClass(ScenicRoute);
