import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ServiceType } from 'src/share/enums';
import { TripStatus } from 'src/share/enums/trip.enum';

export type TripDocument = HydratedDocument<Trip>;
@Schema({ _id: false })
class Position {
    @Prop({ required: true, type: Number })
    lat: number;

    @Prop({ required: true, type: Number })
    lng: number;
}
@Schema({ timestamps: true })
export class Trip {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    customerId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    driverId: Types.ObjectId;

    @Prop({ type: Date, required: true })
    timeStart: Date;

    @Prop({ type: Date })
    timeEnd: Date;

    @Prop({ type: Date, required: true })
    timeStartEstimate: Date;

    @Prop({ type: Date })
    timeEndEstimate: Date;

    @Prop({ type: Types.ObjectId, ref: 'Vehicle', required: true })
    vehicleId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'DriverSchedule', required: true })
    scheduleId: Types.ObjectId;

    @Prop({
        type: String,
        enum: ServiceType,
        required: true
    })
    serviceType: ServiceType;

    @Prop({ required: true, type: [Position] })
    tripCoordinates: Position[];

    @Prop({
        type: {
            bookingHour: {
                totalTime: Number, // in minutes
                startPoint: String,
            },
            bookingScenicRoute: {
                routeId: Types.ObjectId,
                startPoint: String,
                distanceEstimate: Number,
                distance: Number
            },
            bookingDestination: {
                startPoint: String,
                endPoint: String,
                distanceEstimate: Number,
                distance: Number
            },
            bookingShare: {
                numberOfSeat: Number,
                startPoint: String,
                endPoint: String,
                distanceEstimate: Number,
                distance: Number
            }
        },
        required: true
    })
    servicePayload: {
        bookingHour?: {
            totalTime: number;
            startPoint: string; //lat,lng
        };
        bookingScenicRoute?: {
            routeId: Types.ObjectId;
            startPoint: string;
        };
        bookingDestination?: {
            startPoint: string;
            endPoint: string;
        };
        bookingShare?: {
            numberOfSeat: number;
            startPoint: string;
            endPoint: string;
        };
    };

    @Prop({ type: Number })
    amount: number;

    @Prop({
        type: String,
        enum: TripStatus,
        default: TripStatus.BOOKING
    })
    status: TripStatus;

    @Prop({ type: Date })
    cancellationTime: Date;

    @Prop({ type: String })
    cancellationReason: string;

    @Prop({ type: Number })
    refundAmount: number;

    @Prop({
        type: [{
            status: { type: String, enum: TripStatus },
            changedAt: Date,
            reason: String
        }], default: []
    })
    statusHistory: Array<{
        status: TripStatus;
        changedAt: Date;
        reason?: string;
    }>;
}

export const TripSchema = SchemaFactory.createForClass(Trip);

// Add validation middleware
TripSchema.pre<Trip>('validate', function (next) {
    const serviceType = this.serviceType;
    const payload = this.servicePayload;

    const validators = {
        [ServiceType.BOOKING_HOUR]: () => {
            if (!payload.bookingHour) return false;
            return payload.bookingHour.totalTime && payload.bookingHour.startPoint;
        },
        [ServiceType.BOOKING_SCENIC_ROUTE]: () => {
            if (!payload.bookingScenicRoute) return false;
            return payload.bookingScenicRoute.routeId && payload.bookingScenicRoute.startPoint;
        },
        [ServiceType.BOOKING_DESTINATION]: () => {
            if (!payload.bookingDestination) return false;
            return payload.bookingDestination.startPoint && payload.bookingDestination.endPoint;
        },
        [ServiceType.BOOKING_SHARE]: () => {
            if (!payload.bookingShare) return false;
            return payload.bookingShare.numberOfSeat &&
                payload.bookingShare.startPoint &&
                payload.bookingShare.endPoint;
        }
    };

    if (!validators[serviceType]?.()) {
        return next(new Error(`Invalid payload for service type ${serviceType}`));
    }

    next();
});
