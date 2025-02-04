import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { ServiceType } from "src/share/enums";

export type ServiceConfigDocument = Document & ServiceConfig;

@Schema({ collection: 'ServiceConfigs', timestamps: true })
export class ServiceConfig {
    @Prop({ type: String, enum: ServiceType, unique: true })
    service_type: ServiceType;

    @Prop({ required: true })
    base_unit: number;

    @Prop({ required: true })
    base_unit_type: string;
}

export const ServiceConfigSchema = SchemaFactory.createForClass(ServiceConfig);