import { VehicleCategoryDocument } from 'src/modules/vehicle-categories/vehicle-category.schema';
import { ICreateVehicle, IUpdateVehicle, vehicleParams } from 'src/modules/vehicles/vehicle.dto';
import { VehicleDocument } from 'src/modules/vehicles/vehicles.schema';
import { VehicleOperationStatus } from 'src/share/enums';
import { QueryOptions } from 'src/share/interface';

export const vehicleStatus = ['available', 'in-use', 'maintenance'] as const;

export interface IVehiclesRepository {
  list(): Promise<VehicleDocument[]>;
  getById(id: string): Promise<VehicleDocument | null>;
  insert(data: ICreateVehicle): Promise<VehicleDocument>;
  update(id: string, dto: IUpdateVehicle): Promise<VehicleDocument>;
  getListVehicles(
    query: object,
    select: string[],
    options?: QueryOptions,
  ): Promise<VehicleDocument[] | null>;
  getListVehiclesPopulateCategory(
    query: object,
    select: string[],
    options?: QueryOptions,
  ): Promise<VehicleDocument[] | null>;

  getVehicle(query: object, select: string[]): Promise<VehicleDocument | null>;
  updateOperationStatus(id: string, status: VehicleOperationStatus): Promise<VehicleDocument>;
}

export interface IVehiclesService {
  list(): Promise<VehicleDocument[]>;
  getById(id: string): Promise<VehicleDocument | null>;
  insert(data: ICreateVehicle): Promise<VehicleDocument>;
  update(id: string, dto: IUpdateVehicle): Promise<VehicleDocument>;
  getListVehicles(query: vehicleParams): Promise<VehicleDocument[] | null>;
  getListVehiclesPopulateCategory(query: vehicleParams): Promise<VehicleDocument[] | null>;
  getVehicleCategoryByVehicleId(vehicleId: string): Promise<VehicleCategoryDocument | null>;
  findById(id: string): Promise<any>;
  update(id: string, data: any): Promise<any>;
}
