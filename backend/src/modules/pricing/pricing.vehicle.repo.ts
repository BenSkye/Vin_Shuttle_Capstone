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
        return this.pricingModel.create(pricing);
    }

    async findByVehicleCategory(vehicleId: string): Promise<VehiclePricingDocument> {
        return this.pricingModel.findOne({ vehicle_category: vehicleId }).exec();
    }

    async findAll(): Promise<VehiclePricingDocument[]> {
        return this.pricingModel.find().exec();
    }
}