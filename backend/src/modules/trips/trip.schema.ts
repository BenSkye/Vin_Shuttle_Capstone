import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ _id: false })
class Position {
    @Prop({ required: true, type: Number })
    lat: number;

    @Prop({ required: true, type: Number })
    lng: number;
}

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

@Schema({ _id: false })
class Route {
    @Prop({ required: true, type: [Waypoint] })
    waypoints: Waypoint[];

    @Prop({ required: true, type: [Position] })
    routeCoordinates: Position[];

    @Prop({ required: true, type: Number })
    estimatedDuration: number;

    @Prop({ required: true, type: Number })
    totalDistance: number;
}

@Schema({ timestamps: true })
export class Trip extends Document {
    @Prop({ required: true, type: String })
    name: string;

    @Prop({ required: true, type: String })
    description: string;

    @Prop({ required: true, type: String, enum: ['active', 'inactive'], default: 'active' })
    status: string;

    @Prop({ required: true, type: Route })
    route: Route;

    // @Prop({ required: true, type: [String] })
    // vehicleCategories: string[];

    // @Prop({ required: true, type: [String] })
    // tags: string[];
}

export const TripSchema = SchemaFactory.createForClass(Trip);
