import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type VehicleCategoryDocument = HydratedDocument<VehicleCategory>;

@Schema({ collection: 'VehicleCategory' })
export class VehicleCategory {
    @Prop({ required: true })
    name: string;

    @Prop({ default: '' })
    description: string;

    @Prop({ required: true })
    numberOfSeat: number;
}

export const VehicleCategorySchema = SchemaFactory.createForClass(VehicleCategory);
