import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ICreateVehicle, IUpdateVehicle } from "src/modules/vehicles/vehicles.port";
import { Vehicle, VehicleDocument } from "src/modules/vehicles/vehicles.schema";

@Injectable()
export class VehiclesRepository {
    constructor(
        @InjectModel(Vehicle.name) private readonly vehicleModel: Model<Vehicle>,
    ) { }

    async list(): Promise<VehicleDocument[]> {
        const result = await this.vehicleModel.find().exec();
        return result
    }
    async getById(id: string): Promise<VehicleDocument | null> {
        const result = await this.vehicleModel.findById(id).exec();
        return result
    }
    async insert(data: ICreateVehicle): Promise<VehicleDocument> {
        // const categoryId =  data.categoryId.toString()
        // const isExistCategory = await this.vehicleCategoryRepository.getById(categoryId)
        // if(!isExist){

        // }
        const newVehicle = await this.vehicleModel.create(data)
        return newVehicle
    }
    async update(id: string, dto: IUpdateVehicle): Promise<VehicleDocument> {
        const updatedVehicle = await this.vehicleModel.findByIdAndUpdate(id, dto, { new: true })
        return updatedVehicle
    }
}
