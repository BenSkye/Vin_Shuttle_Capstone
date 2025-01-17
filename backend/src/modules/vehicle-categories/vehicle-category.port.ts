import { VehicleCategoryDocument } from "src/modules/vehicle-categories/vehicle-category.schema";



export interface IVehicleCategoryRepository {
    list(): Promise<VehicleCategoryDocument[]>;
    getById(id: string): Promise<VehicleCategoryDocument | null>
    insert(data: object): Promise<VehicleCategoryDocument>
    update(id: string, dto: object): Promise<VehicleCategoryDocument>;
}

export interface IVehicleCategoryService {
    list(): Promise<VehicleCategoryDocument[]>;
    getById(id: string): Promise<VehicleCategoryDocument | null>
    insert(data: object): Promise<VehicleCategoryDocument>
    update(id: string, dto: object): Promise<VehicleCategoryDocument>;
}

