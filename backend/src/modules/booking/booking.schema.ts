import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BookingStatus } from 'src/share/enums';
import { PaymentMethod } from 'src/share/enums/payment.enum';

export type BookingDocument = HydratedDocument<Booking>;

@Schema({ collection: 'Bookings', timestamps: true })
export class Booking {
    @Prop({ type: Number, unique: true })
    bookingCode: number;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    customerId: Types.ObjectId;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Trip' }], required: true })
    trips: [{
        type: Types.ObjectId,
        ref: 'Trip'
    }]

    @Prop({
        type: String,
        enum: BookingStatus,
        default: BookingStatus.PENDING,
    })
    status: BookingStatus;

    @Prop({ type: Number, required: true })
    totalAmount: number;

    @Prop({ type: String, enum: PaymentMethod, default: PaymentMethod.PAY_OS })
    paymentMethod: string;

    @Prop({ type: Date })
    expireAt: Date;

    @Prop({
        type: [
            {
                status: { type: String, enum: BookingStatus },
                changedAt: Date,
                reason: String,
            },
        ],
        default: [],
    })
    statusHistory: Array<{
        status: BookingStatus;
        changedAt: Date;
        reason?: string;
    }>;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

// Add indexes
BookingSchema.index({ customerId: 1, status: 1 });
BookingSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
// Middleware tự động cập nhật lịch sử trạng thái
BookingSchema.pre<Booking>('save', function (next) {
    const modifiedPaths = (this as any).modifiedPaths();
    console.log('modifiedPaths', modifiedPaths)
    // Kiểm tra cả trường hợp tạo mới và cập nhật
    if ((this as any).isNew || modifiedPaths.includes('status')) {
        const currentStatus = this.status;

        if (currentStatus === BookingStatus.CONFIRMED) {
            this.expireAt = null;
        } else if ((this as any).isNew) {
            // Nếu là bản ghi mới, đặt expireAt là 2 phút sau
            this.expireAt = new Date(Date.now() + 1 * 60 * 1000);
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
