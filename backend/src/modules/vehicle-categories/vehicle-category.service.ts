import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import { VEHICLE_CATEGORY_REPOSITORY } from 'src/modules/vehicle-categories/vehicle-category.di-token';
import {
  ICreateVehicleCategoryDto,
  IUpdateVehicleCategoryDto,
} from 'src/modules/vehicle-categories/vehicle-category.dto';
import {
  IVehicleCategoryRepository,
  IVehicleCategoryService,
} from 'src/modules/vehicle-categories/vehicle-category.port';
import { VehicleCategoryDocument } from 'src/modules/vehicle-categories/vehicle-category.schema';

@Injectable()
export class VehicleCategoryService implements IVehicleCategoryService {
  constructor(
    @Inject(VEHICLE_CATEGORY_REPOSITORY)
    private readonly vehicleCategoryRepository: IVehicleCategoryRepository,
  ) { }

  async list(): Promise<VehicleCategoryDocument[]> {
    const listVehicleCategory = await this.vehicleCategoryRepository.list();
    return listVehicleCategory;
  }
  async getById(id: string): Promise<VehicleCategoryDocument | null> {
    if (!isValidObjectId(id)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Invalid ID format',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const vehicleCategory = this.vehicleCategoryRepository.getById(id);
    if (!vehicleCategory) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Vehicle category with ID ${id} not found`,
          vnMessage: `Loại xe ${id} không tìm thấy`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return vehicleCategory;
  }
  async insert(data: ICreateVehicleCategoryDto): Promise<VehicleCategoryDocument> {
    const newVehicleCategory = await this.vehicleCategoryRepository.insert(data);

    if (!newVehicleCategory) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `can not insert vehicle category`,
          vnMessage: 'Lỗi tạo loại xe',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return newVehicleCategory;
  }
  async update(id: string, dto: IUpdateVehicleCategoryDto): Promise<VehicleCategoryDocument> {
    const updatedVehicleCategory = await this.vehicleCategoryRepository.update(id, dto);
    return updatedVehicleCategory;
  }
}
