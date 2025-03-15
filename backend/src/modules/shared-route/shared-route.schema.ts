import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { SharedRouteStatus, SharedRouteStopsType } from "src/share/enums/shared-route.enum";
import { Position, PositionSchema, StartOrEndPointSchema } from "src/share/share.schema";

export type SharedRouteDocument = HydratedDocument<SharedRoute>;

@Schema({ collection: 'SharedRoutes', timestamps: true })
export class SharedRoute {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    driverId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Vehicle', required: true })
    vehicleId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'DriverSchedule', required: true })
    scheduleId: Types.ObjectId;

    @Prop({
        type: [{
            _id: false,
            order: { type: Number, required: true },
            pointType: {
                type: String,
                enum: SharedRouteStopsType,
                required: true
            },
            trip: {
                type: String,
                ref: 'Trip',
                required: true
            },
            point: { type: StartOrEndPointSchema, required: true },
            isPass: { type: Boolean, default: false }
        }],
        default: [],
        required: true
    })
    stops: Array<{
        order: number;
        pointType: SharedRouteStopsType;
        trip: string;
        point: {
            position: Position;
            address: string;
        };
        isPass: boolean;
    }>;

    @Prop({ type: [PositionSchema] })
    optimizedCoordinates: Position[];

    @Prop({ type: Number, required: true })
    distanceEstimate: number;

    @Prop({ type: Number })
    distanceActual: number;

    @Prop({ type: Number, required: true })
    durationEstimate: number;

    @Prop({ type: Number })
    durationActual: number;

    @Prop({
        type: String,
        enum: SharedRouteStatus,
        default: SharedRouteStatus.PLANNED
    })
    status: SharedRouteStatus;

}

export const SharedRouteSchema = SchemaFactory.createForClass(SharedRoute);

// @Prop({ type: Date, required: true })
// plannedStartTime: Date;

// @Prop({ type: Date })
// actualStartTime: Date;

// @Prop({ type: Date })
// actualEndTime: Date;