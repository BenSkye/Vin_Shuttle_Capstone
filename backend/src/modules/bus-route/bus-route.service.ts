import { Injectable, Inject, NotFoundException, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { IBusRouteService, IBusRouteRepository, ICreateBusRouteData } from './bus-route.port';
import { BusRouteDocument } from './bus-route.schema';
import { CreateBusRouteDto, RouteStopDto, UpdateBusRouteDto } from './bus-route.dto';
import { BUS_ROUTE_REPOSITORY } from './bus-route.di-token';
import { IBusStopService } from '../bus-stop/bus-stop.port';
import { BUS_STOP_SERVICE } from '../bus-stop/bus-stop.di-token';
import { PRICING_SERVICE } from '../pricing/pricing.di-token';
import { IPricingService } from '../pricing/pricing.port';
import { VEHICLE_CATEGORY_SERVICE } from '../vehicle-categories/vehicle-category.di-token';
import { IVehicleCategoryService } from '../vehicle-categories/vehicle-category.port';
import { ServiceType } from 'src/share/enums';
import { Types } from 'mongoose';

@Injectable()
export class BusRouteService implements IBusRouteService {
  constructor(
    @Inject(BUS_ROUTE_REPOSITORY)
    private readonly busRouteRepository: IBusRouteRepository,
    @Inject(BUS_STOP_SERVICE)
    private readonly busStopService: IBusStopService,
    @Inject(PRICING_SERVICE)
    private readonly pricingService: IPricingService,
    @Inject(VEHICLE_CATEGORY_SERVICE)
    private readonly vehicleCategoryService: IVehicleCategoryService,
  ) {}

  private async validateVehicleCategory(vehicleCategoryId: string): Promise<void> {
    const vehicleCategory = await this.vehicleCategoryService.getById(vehicleCategoryId);
    if (!vehicleCategory) {
      throw new BadRequestException({
        message: 'Vehicle category not found',
        vnMessage: 'Không tìm thấy loại phương tiện',
      });
    }
  }

  private async validateStops(stops: RouteStopDto[]): Promise<void> {
    if (!stops || stops.length === 0) {
      throw new BadRequestException('Route must have at least one stop');
    }

    // check if all stopId is valid bus stop
    for (const stop of stops) {
      try {
        await this.busStopService.getBusStopById(stop.stopId);
      } catch (error) {
        throw new BadRequestException(
          `Stop with ID ${stop.stopId} does not exist in list of bus stops`,
        );
      }
    }

    // check if orderIndex is unique
    const orderIndices = stops.map(stop => stop.orderIndex);
    const uniqueOrderIndices = new Set(orderIndices);
    if (orderIndices.length !== uniqueOrderIndices.size) {
      throw new BadRequestException('Order index must be unique');
    }
  }

  async createRoute(dto: CreateBusRouteDto): Promise<BusRouteDocument> {
    await this.validateStops(dto.stops);

    await this.validateVehicleCategory(dto.vehicleCategory);

    const busServiceConfig = await this.pricingService.getServiceConfig(
      ServiceType.BOOKING_BUS_ROUTE,
    );
    console.log('Bus Service Config:', busServiceConfig);

    if (!busServiceConfig) {
      throw new BadRequestException({
        message: 'Bus route service config not found',
        vnMessage: 'Không tìm thấy cấu hình dịch vụ xe buýt',
      });
    }

    const pricing = await this.pricingService.findVehiclePricing({
      vehicle_category: dto.vehicleCategory,
      service_config: busServiceConfig._id,
    });

    if (!pricing) {
      throw new BadRequestException({
        message: 'Vehicle category does not have pricing configuration for bus route service',
        vnMessage: 'Loại phương tiện chưa được cấu hình giá cho dịch vụ xe buýt',
      });
    }

    const createData: ICreateBusRouteData = {
      ...dto,
      pricingConfig: pricing._id.toString(),
    };

    return await this.busRouteRepository.create(createData);
  }

  async getAllRoutes(): Promise<BusRouteDocument[]> {
    return await this.busRouteRepository.findAll();
  }

  async getRouteById(id: string): Promise<BusRouteDocument> {
    const route = await this.busRouteRepository.findById(id);
    if (!route) {
      throw new NotFoundException('Bus route not found');
    }
    return route;
  }

  async updateRoute(id: string, dto: UpdateBusRouteDto): Promise<BusRouteDocument> {
    await this.validateStops(dto.stops);
    const route = await this.busRouteRepository.update(id, dto);
    if (!route) {
      throw new NotFoundException('Bus route not found');
    }
    return route;
  }

  async deleteRoute(id: string): Promise<void> {
    await this.getRouteById(id); // Check if exists
    await this.busRouteRepository.delete(id);
  }

  async calculateFare(
    routeId: string,
    fromStopId: string,
    toStopId: string,
    numberOfSeats: number,
  ): Promise<number> {
    const route = await this.getRouteById(routeId);

    console.log('====================================');
    console.log('route', route);
    console.log('====================================');

    const fromStop = route.stops.find(s => {
      const stopId = s.stopId._id ? s.stopId._id.toString() : s.stopId.toString();
      return stopId === fromStopId;
    });

    const toStop = route.stops.find(s => {
      const stopId = s.stopId._id ? s.stopId._id.toString() : s.stopId.toString();
      return stopId === toStopId;
    });

    console.log('====================================');
    console.log('fromStop', fromStop);
    console.log('====================================');

    console.log('====================================');
    console.log('toStop', toStop);
    console.log('====================================');

    if (!fromStop || !toStop) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid bus stops',
          vnMessage: 'BusRoute: Trạm dừng không hợp lệ',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Tính khoảng cách giữa hai điểm dừng
    const distance = Math.abs(toStop.distanceFromStart - fromStop.distanceFromStart);

    // Lấy pricing config của tuyến xe buýt
    const busServiceConfig = await this.pricingService.getServiceConfig(ServiceType.BOOKING_BUS_ROUTE);
    if (!busServiceConfig) {
      throw new BadRequestException({
        message: 'Bus route service config not found',
        vnMessage: 'Không tìm thấy cấu hình dịch vụ xe buýt',
      });
    }

    // Lấy pricing config của loại xe được gán cho tuyến
    const pricing = await this.pricingService.findVehiclePricing({
      vehicle_category: route.vehicleCategory,
      service_config: busServiceConfig._id,
    });

    if (!pricing) {
      throw new BadRequestException({
        message: 'Vehicle category does not have pricing configuration for bus route service',
        vnMessage: 'Loại phương tiện chưa được cấu hình giá cho dịch vụ xe buýt',
      });
    }

    // Tính giá vé dựa trên khoảng cách và pricing config
    const fare = await this.pricingService.calculatePrice(
      ServiceType.BOOKING_BUS_ROUTE,
      route.vehicleCategory.toString(),
      distance,
    );

    // Nhân với số lượng ghế
    return fare * numberOfSeats;
  }
}
