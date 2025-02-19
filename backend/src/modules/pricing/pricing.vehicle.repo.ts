import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IVehiclePricingRepository } from "./pricing.port";
import { VehiclePricing, VehiclePricingDocument } from "./pricing.vehicle.schema";
import { ICreateVehiclePricingDto } from "./pricing.dto";

@Injectable()
export class VehiclePricingRepository implements IVehiclePricingRepository {
    constructor(
        @InjectModel(VehiclePricing.name)
        private readonly pricingModel: Model<VehiclePricingDocument>
    ) { }

    async create(pricing: ICreateVehiclePricingDto): Promise<VehiclePricingDocument> {
        return await this.pricingModel.create(pricing);
    }

    async findVehiclePricing(query: any): Promise<VehiclePricingDocument> {
        return await this.pricingModel.findOne(query).exec();
    }

    async findByVehicleCategory(vehicleCategoryId: string): Promise<VehiclePricingDocument> {
        return await this.pricingModel.findOne({ vehicle_category: vehicleCategoryId }).exec();
    }

    async findAll(): Promise<VehiclePricingDocument[]> {
        return await this.pricingModel.find().exec();
    }

    async update(update: ICreateVehiclePricingDto): Promise<VehiclePricingDocument> {
        try {
            console.log('update', update)
            const updated = await this.pricingModel.findOneAndUpdate({
                vehicle_category: update.vehicle_category,
                service_config: update.service_config
            }, {
                $set: {
                    tiered_pricing: update.tiered_pricing
                }
            }, { new: true }).exec();

            console.log('updated', updated);

            return updated;
        } catch (error) {
            console.log('error', error);
            return null;
        }

    }
}