import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';


export type RatingDocument = HydratedDocument<Rating>;

@Schema({ collection: 'Ratings', timestamps: true })
export class Rating {
    @Prop({ type: Types.ObjectId, ref: 'Trip', required: true })
    tripId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    customerId: Types.ObjectId;

    @Prop({ required: true, type: Number, min: 1, max: 5 })
    rate: number;

    @Prop({ required: true, type: String })
    feedback: string;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);
