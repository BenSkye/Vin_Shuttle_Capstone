import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { ROUTE_REPOSITORY } from "src/modules/route/route.di-token";
import { ICreateRouteDto, IUpdateRouteDto } from "src/modules/route/route.dto";
import { IRouteRepository, IRouteService } from "src/modules/route/route.port";
import { Route } from "src/modules/route/route.schema";


@Injectable()
export class RouteService implements IRouteService {
    constructor(
        @Inject(ROUTE_REPOSITORY)
        private readonly routeRepository: IRouteRepository
    ) { }

    async createRoute(route: ICreateRouteDto): Promise<Route> {
        const newRoute = await this.routeRepository.create(route);
        if (!newRoute) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Failed to create route'
            }, HttpStatus.BAD_REQUEST);
        }
        return newRoute;
    }

    async getRoute(id: string): Promise<Route> {
        const route = await this.routeRepository.findById(id);
        if (!route) {
            throw new HttpException({
                statusCode: HttpStatus.NOT_FOUND,
                message: 'Route not found'
            }, HttpStatus.NOT_FOUND);
        }
        return route;
    }

    async getAllRoutes(): Promise<Route[]> {
        return await this.routeRepository.findAll();
    }

    async updateRoute(id: string, route: IUpdateRouteDto): Promise<Route> {
        const updatedRoute = await this.routeRepository.update(id, route);
        if (!updatedRoute) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Failed to update route'
            }, HttpStatus.BAD_REQUEST);
        }
        return updatedRoute;

    }

}
