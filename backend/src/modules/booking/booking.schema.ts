import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BookingStatus } from 'src/share/enums';
import { PaymentMethod } from 'src/share/enums/payment.enum';

export type BookingDocument = Booking & Document;



@Schema({ timestamps: true })
export class Booking {
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
