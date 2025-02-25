import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { VEHICLE_CATEGORY_REPOSITORY } from 'src/modules/vehicle-categories/vehicle-category.di-token';
import { IVehicleCategoryRepository } from 'src/modules/vehicle-categories/vehicle-category.port';
import { ICreateVehicle, IUpdateVehicle } from 'src/modules/vehicles/vehicle.dto';
import { VEHICLE_REPOSITORY } from 'src/modules/vehicles/vehicles.di-token';
import { IVehiclesRepository } from 'src/modules/vehicles/vehicles.port';
import { VehicleDocument } from 'src/modules/vehicles/vehicles.schema';

@Injectable()
export class VehiclesService {
  constructor(
    @Inject(VEHICLE_CATEGORY_REPOSITORY)
    private readonly vehicleCategoryRepository: IVehicleCategoryRepository,
    @Inject(VEHICLE_REPOSITORY) private readonly vehicleRepository: IVehiclesRepository,
  ) {}

  async list(): Promise<VehicleDocument[]> {
    const listVehicle = await this.vehicleRepository.list();
    return listVehicle;
  }
  async getById(id: string): Promise<VehicleDocument | null> {
    const vehicle = await this.vehicleRepository.getById(id);
    return vehicle;
  }
  async insert(data: ICreateVehicle): Promise<VehicleDocument> {
    try {
      const categoryId = data.categoryId.toString();
      const isExistCategory = await this.vehicleCategoryRepository.getById(categoryId);
      if (!isExistCategory) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Invalid Vehicle Category ID ',
            vnMesage: 'Không tìm thấy loại xe',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      console.log('data', data);
      const newVehicle = await this.vehicleRepository.insert(data);
      return newVehicle;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async update(id: string, data: IUpdateVehicle): Promise<VehicleDocument> {
    if (data.categoryId) {
      const categoryId = data.categoryId.toString();
      const isExistCategory = await this.vehicleCategoryRepository.getById(categoryId);
      if (!isExistCategory) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Invalid Vehicle Category ID',
            vnMesage: 'Không tìm thấy loại xe',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    const updatedVehicle = await this.vehicleRepository.update(id, data);
    return updatedVehicle;
  }
}
