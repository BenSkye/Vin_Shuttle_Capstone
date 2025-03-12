import { Prop, Schema } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { SharedRouteStatus } from "src/share/enums/shared-route.enum";
import { Position, PositionSchema } from "src/share/share.schema";

@Schema({ collection: 'SharedRoutes', timestamps: true })
export class SharedRoute {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    driverId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Vehicle', required: true })
    vehicleId: Types.ObjectId;

    @Prop({
        type: [{
            order: { type: Number, required: true }, // Thứ tự thực hiện
            pointType: { // Chỉ định điểm này là startPoint hay endPoint của Trip
                type: String,
                enum: ['startPoint', 'endPoint'],
                required: true
            },
            trip: {
                type: Types.ObjectId,
                ref: 'Trip',
                required: true
            },
            position: { type: PositionSchema, required: true },
            address: { type: String, required: true },
            isPass: { type: Boolean, default: false }
        }],
        required: true
    })
    stops: Array<{
        order: number;
        pointType: 'startPoint' | 'endPoint';
        trip: Types.ObjectId;
        position: Position;
        address: string;
        isPass: boolean;
    }>;

    @Prop({ type: [PositionSchema], required: true })
    optimizedCoordinates: Position[];

    @Prop({ type: Number, required: true })
    numberOfSeatsUsed: number;

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
    status: string;

}



// @Prop({ type: Date, required: true })
// plannedStartTime: Date;

// @Prop({ type: Date })
// actualStartTime: Date;

// @Prop({ type: Date })
// actualEndTime: Date;