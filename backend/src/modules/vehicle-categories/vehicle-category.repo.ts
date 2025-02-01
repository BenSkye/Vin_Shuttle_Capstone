import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ICreateVehicleCategoryDto, IUpdateVehicleCategoryDto } from "src/modules/vehicle-categories/vehicle-category.dto";
import { IVehicleCategoryRepository } from "src/modules/vehicle-categories/vehicle-category.port";
import { VehicleCategory, VehicleCategoryDocument } from "src/modules/vehicle-categories/vehicle-category.schema";


@Injectable()
export class VehicleCategoryRepository implements IVehicleCategoryRepository {

    constructor(
        @InjectModel(VehicleCategory.name) private readonly vehicleCategoryModel: Model<VehicleCategory>
    ) {
    }

    async list(): Promise<VehicleCategoryDocument[]> {
        const result = await this.vehicleCategoryModel.find().exec();
        return result;
    }


    async getById(id: string): Promise<VehicleCategoryDocument | null> {
        const result = await this.vehicleCategoryModel.findById(id).exec();
        return result
    }
    async insert(data: ICreateVehicleCategoryDto): Promise<VehicleCategoryDocument> {
        const newVehicleCategory = await this.vehicleCategoryModel.create(data)
        return newVehicleCategory
    }
    async update(id: string, dto: IUpdateVehicleCategoryDto): Promise<VehicleCategoryDocument> {
        const result = await this.vehicleCategoryModel.findByIdAndUpdate(id, dto, { new: true }).exec()
        return result
    }

}