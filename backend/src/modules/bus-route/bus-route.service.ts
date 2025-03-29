import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { IBusRouteService, IBusRouteRepository } from './bus-route.port';
import { BusRouteDocument } from './bus-route.schema';
import { CreateBusRouteDto, RouteStopDto, UpdateBusRouteDto } from './bus-route.dto';
import { BUS_ROUTE_REPOSITORY } from './bus-route.di-token';
import { IBusStopService } from '../bus-stop/bus-stop.port';
import { BUS_STOP_SERVICE } from '../bus-stop/bus-stop.di-token';
import { PRICING_SERVICE } from '../pricing/pricing.di-token';
import { IPricingService } from '../pricing/pricing.port';

@Injectable()
export class BusRouteService implements IBusRouteService {
  constructor(
    @Inject(BUS_ROUTE_REPOSITORY)
    private readonly busRouteRepository: IBusRouteRepository,
    @Inject(BUS_STOP_SERVICE)
    private readonly busStopService: IBusStopService,
    @Inject(PRICING_SERVICE)
    private readonly pricingService: IPricingService,
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
    
    // check if vehicle category has pricing config
    const hasPricing = await this.pricingService.checkVehicleCategoryAndServiceType(
      dto.vehicleCategory,
      'booking_trip'
    );

    if (!hasPricing) {
      throw new BadRequestException('Vehicle category does not have pricing configuration');
    }

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

    // calculate distance between two stops
    const distance = Math.abs(toStop.distanceFromStart - fromStop.distanceFromStart);

    // use pricing service to calculate price
    const fare = await this.pricingService.calculatePrice(
      'booking_trip', // service_type for bus route
      route.vehicleCategory.toString(),
      distance // total_units is distance
    );

    // multiply by number of seats
    return fare * numberOfSeats;
  }
}
