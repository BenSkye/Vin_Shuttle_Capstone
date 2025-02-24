import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { SCENIC_ROUTE_REPOSITORY } from "src/modules/scenic-route/scenic-route.di-token";
import { ICreateScenicRouteDto, IUpdateScenicRouteDto } from "src/modules/scenic-route/scenic-route.dto";
import { IScenicRouteRepository, IScenicRouteService } from "src/modules/scenic-route/scenic-route.port";
import { ScenicRoute } from "src/modules/scenic-route/scenic-route.schema";


@Injectable()
export class ScenicRouteService implements IScenicRouteService {
    constructor(
        @Inject(SCENIC_ROUTE_REPOSITORY)
        private readonly routeRepository: IScenicRouteRepository
    ) { }

    async createScenicRoute(route: ICreateScenicRouteDto): Promise<ScenicRoute> {
        const newScenicRoute = await this.routeRepository.create(route);
        if (!newScenicRoute) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Failed to create scenic route',
                vnMesage: 'Không thể tạo tuyến đường ngăm cảnh',
            }, HttpStatus.BAD_REQUEST);
        }
        return newScenicRoute;
    }

    async getScenicRoute(id: string): Promise<ScenicRoute> {
        const route = await this.routeRepository.findById(id);
        if (!route) {
            throw new HttpException({
                statusCode: HttpStatus.NOT_FOUND,
                message: 'ScenicRoute not found',
                vnMesage: 'Không tìm thấy tuyến đường ngắm cảnh',
            }, HttpStatus.NOT_FOUND);
        }
        return route;
    }

    async getAllScenicRoutes(): Promise<ScenicRoute[]> {
        return await this.routeRepository.findAll();
    }

    async updateScenicRoute(id: string, route: IUpdateScenicRouteDto): Promise<ScenicRoute> {
        const updatedScenicRoute = await this.routeRepository.update(id, route);
        if (!updatedScenicRoute) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Failed to update scenic route',
                vnMesage: 'Không thể sửa tuyến đường ngăm cảnh',
            }, HttpStatus.BAD_REQUEST);
        }
        return updatedScenicRoute;

    }

}
