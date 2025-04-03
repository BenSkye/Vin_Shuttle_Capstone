import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ServiceType } from 'src/share/enums';
import { paymentTime } from 'src/share/enums/payment.enum';
import { TripCancelBy, TripStatus } from 'src/share/enums/trip.enum';
import { Position, PositionSchema, StartOrEndPointSchema } from 'src/share/share.schema';

export type TripDocument = HydratedDocument<Trip>;

@Schema({ collection: 'Trips', timestamps: true })
export class Trip {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  customerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  driverId: Types.ObjectId;

  @Prop({ type: Date, default: null })
  timeStart: Date;

  @Prop({ type: Date, default: null })
  timeEnd: Date;

  @Prop({ type: Date, required: true })
  timeStartEstimate: Date;

  @Prop({ type: Date, required: true })
  timeEndEstimate: Date;

  @Prop({ type: Types.ObjectId, ref: 'Vehicle', required: true })
  vehicleId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'DriverSchedule', required: true })
  scheduleId: Types.ObjectId;

  @Prop({
    type: String,
    enum: ServiceType,
    required: true,
  })
  serviceType: ServiceType;

  @Prop({ required: true, type: [PositionSchema] })
  tripCoordinates: Position[];

  @Prop({
    type: {
      bookingHour: {
        totalTime: Number,
        startPoint: StartOrEndPointSchema,
      },
      bookingScenicRoute: {
        routeId: Types.ObjectId,
        startPoint: StartOrEndPointSchema,
        distanceEstimate: Number,
        distance: Number,
      },
      bookingDestination: {
        startPoint: StartOrEndPointSchema,
        endPoint: StartOrEndPointSchema,
        distanceEstimate: Number,
        distance: Number,
      },
      bookingShare: {
        sharedItinerary: Types.ObjectId,
        numberOfSeat: Number,
        startPoint: StartOrEndPointSchema,
        endPoint: StartOrEndPointSchema,
        distanceEstimate: Number,
        distance: Number,
        // isSharedItineraryMain: Boolean,
      },
      bookingBusRoute: {
        routeId: Types.ObjectId,
        fromStopId: Types.ObjectId,
        toStopId: Types.ObjectId,
        distanceEstimate: Number,
        distance: Number,
        numberOfSeat: Number,
      },
    },
    required: true,
  })
  servicePayload: {
    bookingHour?: {
      totalTime: number;
      startPoint: {
        position: Position;
        address: string;
      };
    };
    bookingScenicRoute?: {
      routeId: Types.ObjectId;
      startPoint: {
        position: Position;
        address: string;
      };
      distanceEstimate: number;
      distance: number;
    };
    bookingDestination?: {
      startPoint: {
        position: Position;
        address: string;
      };
      endPoint: {
        position: Position;
        address: string;
      };
      distanceEstimate: number;
      distance: number;
    };
    bookingShare?: {
      sharedItinerary: Types.ObjectId;
      numberOfSeat: number;
      startPoint: {
        position: Position;
        address: string;
      };
      endPoint: {
        position: Position;
        address: string;
      };
      distanceEstimate: number;
      distance: number;
      // isSharedItineraryMain: boolean;
    };
    bookingBusRoute?: {
      routeId: Types.ObjectId;
      fromStopId: Types.ObjectId;
      toStopId: Types.ObjectId;
      distanceEstimate: number;
      distance: number;
      numberOfSeat: number;
    };
  };

  @Prop({ type: Number })
  amount: number;

  @Prop({
    type: String,
    enum: TripStatus,
    default: TripStatus.BOOKING,
  })
  status: TripStatus;

  @Prop({ type: Boolean, default: false })
  isRating: boolean;

  @Prop({ type: Date, default: null })
  cancellationTime: Date;

  @Prop({ type: String, default: '' })
  cancellationReason: string;

  @Prop({ type: String, enum: TripCancelBy, default: null })
  cancelledBy: TripCancelBy;

  @Prop({ type: Number, default: 0 })
  refundAmount: number;

  @Prop({ type: Date })
  expireAt: Date;

  @Prop({
    type: [
      {
        status: { type: String, enum: TripStatus },
        changedAt: Date,
      },
    ],
    default: [],
  })
  statusHistory: Array<{
    status: TripStatus;
    changedAt: Date;
  }>;
}

export const TripSchema = SchemaFactory.createForClass(Trip);

TripSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

// Add validation middleware
TripSchema.pre<Trip>('validate', function (next) {
  const serviceType = this.serviceType;
  const payload = this.servicePayload;

  const validators = {
    [ServiceType.BOOKING_HOUR]: () => {
      if (!payload.bookingHour) return false;
      const result = payload.bookingHour.totalTime && payload.bookingHour.startPoint.position;
      return result;
    },
    [ServiceType.BOOKING_SCENIC_ROUTE]: () => {
      if (!payload.bookingScenicRoute) return false;
      return payload.bookingScenicRoute.routeId && payload.bookingScenicRoute.startPoint.position;
    },
    [ServiceType.BOOKING_DESTINATION]: () => {
      if (!payload.bookingDestination) return false;
      return (
        payload.bookingDestination.startPoint.position &&
        payload.bookingDestination.endPoint.position
      );
    },
    [ServiceType.BOOKING_SHARE]: () => {
      if (!payload.bookingShare) return false;
      return (
        payload.bookingShare.numberOfSeat &&
        payload.bookingShare.startPoint.position &&
        payload.bookingShare.endPoint.position
      );
    },
    [ServiceType.BOOKING_BUS_ROUTE]: () => {
      if (!payload.bookingBusRoute) return false;
      return (
        payload.bookingBusRoute.routeId &&
        payload.bookingBusRoute.fromStopId &&
        payload.bookingBusRoute.toStopId
      );
    },
  };

  if (!validators[serviceType]?.()) {
    return next(new Error(`Invalid payload for service type ${serviceType}`));
  }

  next();
});

TripSchema.pre<Document & Trip>('save', function (next) {
  if ((this as any).isNew || (this as any).isModified('status')) {
    const currentStatus = this.status;

    if (currentStatus === TripStatus.PAYED) {
      this.expireAt = null;
    } else if ((this as any).isNew) {
      this.expireAt = new Date(Date.now() + paymentTime * 60 * 1000);
    }

    if (!(this as any).isNew) {
      const lastStatus = this.statusHistory.slice(-1)[0]?.status;
      if (lastStatus === currentStatus) return next();
    }

    this.statusHistory = this.statusHistory || [];
    this.statusHistory.push({
      status: currentStatus,
      changedAt: new Date(),
    });
  }
  next();
});
