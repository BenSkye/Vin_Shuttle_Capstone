import { CreateRouteDto, UpdateRouteDto } from "src/modules/route/route.dto";
import { Route } from "src/modules/route/route.schema";


export interface IRouteRepository {
    create(route: CreateRouteDto): Promise<Route>;
    findById(id: string): Promise<Route | null>;
    find(query: any): Promise<Route | null>;
    findAll(): Promise<Route[]>;
    update(id: string, route: UpdateRouteDto): Promise<Route | null>;
}

export interface IRouteService {
    createRoute(route: CreateRouteDto): Promise<Route>;
    getRoute(id: string): Promise<Route | null>;
    getAllRoutes(): Promise<Route[]>;
    updateRoute(id: string, route: UpdateRouteDto): Promise<Route | null>;
    // getRoutesByVehicleCategory(category: string): Promise<Route[]>;
}