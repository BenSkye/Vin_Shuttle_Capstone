import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IBusRouteService, IBusRouteRepository } from './bus-route.port';
import { BusRouteDocument } from './bus-route.schema';
import { CreateBusRouteDto, UpdateBusRouteDto } from './bus-route.dto';
import { BUS_ROUTE_REPOSITORY } from './bus-route.di-token';

@Injectable()
export class BusRouteService implements IBusRouteService {
  constructor(
    @Inject(BUS_ROUTE_REPOSITORY)
    private readonly busRouteRepository: IBusRouteRepository,
  ) {}

  async createRoute(dto: CreateBusRouteDto): Promise<BusRouteDocument> {
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
