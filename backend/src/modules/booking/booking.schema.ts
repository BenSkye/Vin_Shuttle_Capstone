import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BookingStatus } from 'src/share/enums';
import { PaymentMethod } from 'src/share/enums/payment.enum';

export type BookingDocument = HydratedDocument<Booking>;



@Schema({ collection: 'Bookings', timestamps: true })
export class Booking {
    @Prop({ type: Number, unique: true })
    bookingCode: number

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    customerId: Types.ObjectId;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Trip' }], required: true })
    trips: Types.ObjectId[];

    @Prop({
        type: String,
        enum: BookingStatus,
        default: BookingStatus.PENDING
    })
    status: BookingStatus;

    @Prop({ type: Number, required: true })
    totalAmount: number;

    @Prop({ type: String, enum: PaymentMethod })
    paymentMethod: string;

    @Prop({ type: String })
    InvoiceId: string;

    @Prop({
        type: [{
            status: { type: String, enum: BookingStatus },
            changedAt: Date,
            reason: String
        }], default: []
    })
    statusHistory: Array<{
        status: BookingStatus;
        changedAt: Date;
        reason?: string;
    }>;

    // @Prop({
    //     type: {
    //         couponCode: String,
    //         discountAmount: Number,
    //         loyaltyPointsUsed: Number
    //     }
    // })
    // discountDetails: {
    //     couponCode?: string;
    //     discountAmount?: number;
    //     loyaltyPointsUsed?: number;
    // };
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

// Add indexes
BookingSchema.index({ customerId: 1, status: 1 });



// Middleware tự động cập nhật lịch sử trạng thái
BookingSchema.pre<Booking>('save', function (next) {
    const modifiedPaths = (this as any).modifiedPaths();
    // Kiểm tra cả trường hợp tạo mới và cập nhật  
    if ((this as any).isNew || modifiedPaths.includes('status')) {
        const currentStatus = this.status;

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