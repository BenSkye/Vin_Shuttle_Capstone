import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { SCENIC_ROUTE_REPOSITORY } from 'src/modules/scenic-route/scenic-route.di-token';
import {
  ICreateScenicRouteDto,
  IUpdateScenicRouteDto,
  scenicRouteParams,
} from 'src/modules/scenic-route/scenic-route.dto';
import {
  IScenicRouteRepository,
  IScenicRouteService,
} from 'src/modules/scenic-route/scenic-route.port';
import { ScenicRouteDocument } from 'src/modules/scenic-route/scenic-route.schema';
import { processQueryParams } from 'src/share/utils/query-params.util';

@Injectable()
export class ScenicRouteService implements IScenicRouteService {
  constructor(
    @Inject(SCENIC_ROUTE_REPOSITORY)
    private readonly routeRepository: IScenicRouteRepository,
  ) {}

  async createScenicRoute(route: ICreateScenicRouteDto): Promise<ScenicRouteDocument> {
    const newScenicRoute = await this.routeRepository.create(route);
    if (!newScenicRoute) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Failed to create scenic route',
          vnMessage: 'Không thể tạo tuyến đường ngăm cảnh',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return newScenicRoute;
  }

  async getScenicRoute(id: string): Promise<ScenicRouteDocument> {
    const route = await this.routeRepository.findById(id);
    if (!route) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'ScenicRoute not found',
          vnMessage: 'Không tìm thấy tuyến đường ngắm cảnh',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return route;
  }

  async getAllScenicRoutes(query?: scenicRouteParams): Promise<ScenicRouteDocument[]> {
    const { filter, options } = processQueryParams(query, ['name']);
    return await this.routeRepository.findAll(filter, options);
  }

  async updateScenicRoute(id: string, route: IUpdateScenicRouteDto): Promise<ScenicRouteDocument> {
    const updatedScenicRoute = await this.routeRepository.update(id, route);
    if (!updatedScenicRoute) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Failed to update scenic route',
          vnMessage: 'Không thể sửa tuyến đường ngăm cảnh',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return updatedScenicRoute;
  }
}
