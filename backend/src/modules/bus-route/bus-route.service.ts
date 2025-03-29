import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { IBusRouteService, IBusRouteRepository } from './bus-route.port';
import { BusRouteDocument } from './bus-route.schema';
import { CreateBusRouteDto, RouteStopDto, UpdateBusRouteDto } from './bus-route.dto';
import { BUS_ROUTE_REPOSITORY } from './bus-route.di-token';
import { IBusStopService } from '../bus-stop/bus-stop.port';
import { BUS_STOP_SERVICE } from '../bus-stop/bus-stop.di-token';

@Injectable()
export class BusRouteService implements IBusRouteService {
  constructor(
    @Inject(BUS_ROUTE_REPOSITORY)
    private readonly busRouteRepository: IBusRouteRepository,
    @Inject(BUS_STOP_SERVICE)
    private readonly busStopService: IBusStopService,
  ) {}

   private async validateStops(stops: RouteStopDto[]): Promise<void> {
    if (!stops || stops.length === 0) {
      throw new BadRequestException('Route must have at least one stop');
    }

    // check if all stopId is valid bus stop
    for (const stop of stops) {
      try {
        await this.busStopService.getBusStopById(stop.stopId);
      } catch (error) {
        throw new BadRequestException(`Stop with ID ${stop.stopId} does not exist in list of bus stops`);
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
    return await this.busRouteRepository.create(dto);
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

    const fromStop = route.stops.find(s => s.stopId.toString() === fromStopId);
    const toStop = route.stops.find(s => s.stopId.toString() === toStopId);

    if (!fromStop || !toStop) {
      throw new NotFoundException('Invalid bus stops');
    }

    const distance = toStop.distanceFromStart - fromStop.distanceFromStart;
    const baseFare = (distance / route.totalDistance) * route.basePrice;

    return Math.round(baseFare * numberOfSeats);
  }
}
