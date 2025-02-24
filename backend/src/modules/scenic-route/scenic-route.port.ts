
import { ICreateScenicRouteDto, IUpdateScenicRouteDto } from "src/modules/scenic-route/scenic-route.dto";
import {  ScenicRouteDocument } from "src/modules/scenic-route/scenic-route.schema";


export interface IScenicRouteRepository {
    create(route: ICreateScenicRouteDto): Promise<ScenicRouteDocument>;
    findById(id: string): Promise<ScenicRouteDocument | null>;
    find(query: any): Promise<ScenicRouteDocument | null>;
    findAll(): Promise<ScenicRouteDocument[]>;
    update(id: string, route: IUpdateScenicRouteDto): Promise<ScenicRouteDocument | null>;
}

export interface IScenicRouteService {
    createScenicRoute(route: ICreateScenicRouteDto): Promise<ScenicRouteDocument>;
    getScenicRoute(id: string): Promise<ScenicRouteDocument | null>;
    getAllScenicRoutes(): Promise<ScenicRouteDocument[]>;
    updateScenicRoute(id: string, route: IUpdateScenicRouteDto): Promise<ScenicRouteDocument | null>;
    // getScenicRoutesByVehicleCategory(category: string): Promise<ScenicRoute[]>;
}