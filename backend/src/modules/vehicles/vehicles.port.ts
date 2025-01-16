import { VehicleDocument } from "src/modules/vehicles/vehicles.schema";

export const vehicleStatus = ['available', 'in-use', 'maintenance'] as const;


export interface IVehiclesRepository {
    list(): Promise<VehicleDocument[]>;
    getById(id: string): Promise<VehicleDocument | null>
    insert(data: object): Promise<VehicleDocument>
    update(id: string, dto: object): Promise<VehicleDocument>;
}

export interface IVehiclesService {
    list(): Promise<VehicleDocument[]>;
    getById(id: string): Promise<VehicleDocument | null>
    insert(data: object): Promise<VehicleDocument>
    update(id: string, dto: object): Promise<VehicleDocument>;
}

export interface ICreateVehicle {
    name: string,
    categoryId: string,
    licensePlate: string,
    isActive?: string,
    status?: string
}

export interface IUpdateVehicle {
    name?: string,
    categoryId?: string,
    licensePlate?: string,
    isActive?: string,
    status?: string
}
