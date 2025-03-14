import { ICreateVehicle, IUpdateVehicle, vehicleParams } from 'src/modules/vehicles/vehicle.dto';
import { VehicleDocument } from 'src/modules/vehicles/vehicles.schema';
import { VehicleOperationStatus } from 'src/share/enums';

export const vehicleStatus = ['available', 'in-use', 'maintenance'] as const;

export interface IVehiclesRepository {
  list(): Promise<VehicleDocument[]>;
  getById(id: string): Promise<VehicleDocument | null>;
  insert(data: ICreateVehicle): Promise<VehicleDocument>;
  update(id: string, dto: IUpdateVehicle): Promise<VehicleDocument>;
  getListVehicles(query: object, select: string[]): Promise<VehicleDocument[] | null>;
  getVehicle(query: object, select: string[]): Promise<VehicleDocument | null>;
  updateOperationStatus(id: string, status: VehicleOperationStatus): Promise<VehicleDocument>;
}

export interface IVehiclesService {
  list(): Promise<VehicleDocument[]>;
  getById(id: string): Promise<VehicleDocument | null>;
  insert(data: ICreateVehicle): Promise<VehicleDocument>;
  update(id: string, dto: IUpdateVehicle): Promise<VehicleDocument>;
  getListVehicles(query: vehicleParams): Promise<VehicleDocument[] | null>;
}
