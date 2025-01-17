import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type VehicleDocument = HydratedDocument<Vehicle>;

@Schema({ collection: 'Vehicles', timestamps: true })
export class Vehicle {
    @Prop({ required: true, unique: true })
    name: string;

    @Prop({ type: Types.ObjectId, ref: 'VehicleCategory', required: true })
    categoryId: Types.ObjectId;

    @Prop({ required: true, unique: true })
    licensePlate: string;  // Biển số xe

    @Prop({ default: true })
    isActive: boolean;     // Trạng thái hoạt động

    @Prop({ default: 'available' })
    status: string;       // Trạng thái: available, in-use, maintenance
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle); 