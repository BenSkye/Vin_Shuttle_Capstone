import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { VehicleCondition, VehicleOperationStatus } from "src/share/enums/vehicle.enum";

export type VehicleDocument = HydratedDocument<Vehicle>;

@Schema({ collection: 'Vehicles', timestamps: true })
export class Vehicle {
    @Prop({ required: true, unique: true })
    name: string;

    @Prop({ type: Types.ObjectId, ref: 'VehicleCategory', required: true })
    categoryId: Types.ObjectId;

    @Prop({ required: true, unique: true })
    licensePlate: string;  // Biển số xe

    @Prop({ type: String, enum: VehicleOperationStatus, default: VehicleOperationStatus.ACTIVE })
    operationStatus: string;

    @Prop({ type: String, enum: VehicleCondition, default: VehicleCondition.AVAILABLE })
    vehicleCondition: string;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle); 