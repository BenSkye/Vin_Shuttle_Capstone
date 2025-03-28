import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { paymentTime } from "src/share/enums/payment.enum";
import { SharedItineraryStatus, SharedItineraryStopsType } from "src/share/enums/shared-itinerary.enum";
import { Position, StartOrEndPointSchema } from "src/share/share.schema";

export type SharedItineraryDocument = HydratedDocument<SharedItinerary>;

@Schema({ collection: 'SharedItineraries', timestamps: true })
export class SharedItinerary {
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
                enum: SharedItineraryStopsType,
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
        pointType: SharedItineraryStopsType;
        trip: string;
        point: {
            position: Position;
            address: string;
        };
        isPass: boolean;
    }>;

    // @Prop({ type: [PositionSchema] })
    // optimizedCoordinates: Position[];

    // @Prop({ type: Number, required: true })
    // distanceEstimate: number;

    // @Prop({ type: Number })
    // distanceActual: number;

    // @Prop({ type: Number, required: true })
    // durationEstimate: number;

    // @Prop({ type: Number })
    // durationActual: number;

    @Prop({
        type: String,
        enum: SharedItineraryStatus,
        default: SharedItineraryStatus.PENDING
    })
    status: SharedItineraryStatus;

    @Prop({
        type: [
            {
                status: { type: String, enum: SharedItineraryStatus },
                changedAt: Date,
                reason: String,
            },
        ],
        default: [],
    })
    statusHistory: Array<{
        status: SharedItineraryStatus;
        changedAt: Date;
        reason?: string;
    }>;

    @Prop({ type: Date })
    expireAt: Date;

}

export const SharedItinerarySchema = SchemaFactory.createForClass(SharedItinerary);

SharedItinerarySchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

SharedItinerarySchema.pre<SharedItinerary>('save', function (next) {
    const modifiedPaths = (this as any).modifiedPaths();
    console.log('modifiedPaths', modifiedPaths)
    // Kiểm tra cả trường hợp tạo mới và cập nhật
    if ((this as any).isNew || modifiedPaths.includes('status')) {
        const currentStatus = this.status;

        if (currentStatus === SharedItineraryStatus.PLANNED) {
            this.expireAt = null;
        } else if ((this as any).isNew) {
            // Nếu là bản ghi mới, đặt expireAt là 2 phút sau
            this.expireAt = new Date(Date.now() + paymentTime * 60 * 1000);
        }

        // Tránh trùng lặp entry đầu tiên khi tạo mới
        if (!(this as any).isNew) {
            const lastEntry = this.statusHistory.slice(-1)[0];
            if (lastEntry?.status === currentStatus) return next();
        }

        this.statusHistory = this.statusHistory || [];
        this.statusHistory.push({
            status: currentStatus,
            changedAt: new Date(),
        });
    }
    next();
});