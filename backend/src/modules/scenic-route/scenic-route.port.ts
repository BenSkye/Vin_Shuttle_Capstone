
import { ICreateScenicRouteDto, IUpdateScenicRouteDto } from "src/modules/scenic-route/scenic-route.dto";
import { ScenicRoute } from "src/modules/scenic-route/scenic-route.schema";


export interface IScenicRouteRepository {
    create(route: ICreateScenicRouteDto): Promise<ScenicRoute>;
    findById(id: string): Promise<ScenicRoute | null>;
    find(query: any): Promise<ScenicRoute | null>;
    findAll(): Promise<ScenicRoute[]>;
    update(id: string, route: IUpdateScenicRouteDto): Promise<ScenicRoute | null>;
}

export interface IScenicRouteService {
    createScenicRoute(route: ICreateScenicRouteDto): Promise<ScenicRoute>;
    getScenicRoute(id: string): Promise<ScenicRoute | null>;
    getAllScenicRoutes(): Promise<ScenicRoute[]>;
    updateScenicRoute(id: string, route: IUpdateScenicRouteDto): Promise<ScenicRoute | null>;
    // getScenicRoutesByVehicleCategory(category: string): Promise<ScenicRoute[]>;
}