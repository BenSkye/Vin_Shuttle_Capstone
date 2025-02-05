import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type VehiclePricingDocument = Document & VehiclePricing;

@Schema({ collection: 'VehiclePricings', timestamps: true })
export class VehiclePricing {
    @Prop({ type: Types.ObjectId, ref: 'VehicleCategory', required: true })
    vehicle_category: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'ServiceConfig', required: true })
    service_config: Types.ObjectId;

    @Prop({
        type: [{
            range: { type: Number, required: true },
            price: { type: Number, required: true }
        }],
        required: true
    })
    tiered_pricing: Array<{
        range: number;
        price: number;
    }>;
}

export const VehiclePricingSchema = SchemaFactory.createForClass(VehiclePricing);