import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ICreateVehicle, IUpdateVehicle } from 'src/modules/vehicles/vehicle.dto';
import { IVehiclesRepository } from 'src/modules/vehicles/vehicles.port';
import { Vehicle, VehicleDocument } from 'src/modules/vehicles/vehicles.schema';
import { VehicleOperationStatus } from 'src/share/enums';
import { QueryOptions } from 'src/share/interface';
import { getSelectData } from 'src/share/utils';
import { applyQueryOptions } from 'src/share/utils/query-params.util';

@Injectable()
export class VehiclesRepository implements IVehiclesRepository {
  constructor(@InjectModel(Vehicle.name) private readonly vehicleModel: Model<Vehicle>) { }

  async list(): Promise<VehicleDocument[]> {
    const result = await this.vehicleModel.find().exec();
    return result;
  }
  async getById(id: string): Promise<VehicleDocument | null> {
    const result = await this.vehicleModel.findById(id).exec();
    return result;
  }
  async insert(data: ICreateVehicle): Promise<VehicleDocument> {
    const newVehicle = await this.vehicleModel.create(data);
    return newVehicle;
  }
  async update(id: string, dto: IUpdateVehicle): Promise<VehicleDocument> {
    const updatedVehicle = await this.vehicleModel.findByIdAndUpdate(id, dto, { new: true });
    return updatedVehicle;
  }

  async getListVehicles(
    query: any,
    select: string[],
    options?: QueryOptions,
  ): Promise<VehicleDocument[] | null> {
    console.log('query', query);
    let queryBuilder = this.vehicleModel.find(query);
    if (select && select.length > 0) {
      queryBuilder = queryBuilder.select(getSelectData(select));
    }
    queryBuilder = applyQueryOptions(queryBuilder, options);
    const result = await queryBuilder.exec();
    return result;
  }
  async getListVehiclesPopulateCategory(
    query: any,
    select: string[],
    options?: QueryOptions,
  ): Promise<VehicleDocument[] | null> {
    console.log('query', query);
    let queryBuilder = this.vehicleModel.find(query).populate('categoryId');
    if (select && select.length > 0) {
      queryBuilder = queryBuilder.select(getSelectData(select));
    }
    queryBuilder = applyQueryOptions(queryBuilder, options);
    const result = await queryBuilder.exec();
    return result;
  }
  async getVehicle(query: any, select: string[]): Promise<VehicleDocument | null> {
    const result = await this.vehicleModel.findOne(query).select(select).exec();
    return result;
  }

  async updateOperationStatus(
    id: string,
    status: VehicleOperationStatus,
  ): Promise<VehicleDocument> {
    const updatedVehicle = await this.vehicleModel.findByIdAndUpdate(
      id,
      { operationStatus: status },
      { new: true },
    );
    return updatedVehicle;
  }
}
