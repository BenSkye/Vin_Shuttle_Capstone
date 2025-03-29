import { BusRouteDocument } from './bus-route.schema';
import { CreateBusRouteDto, UpdateBusRouteDto } from './bus-route.dto';

export interface ICreateBusRouteData extends CreateBusRouteDto {
  pricingConfig: string;
}
export interface IBusRouteRepository {
  create(data: ICreateBusRouteData): Promise<BusRouteDocument>;
  findAll(): Promise<BusRouteDocument[]>;
  findById(id: string): Promise<BusRouteDocument>;
  update(id: string, dto: UpdateBusRouteDto): Promise<BusRouteDocument>;
  delete(id: string): Promise<void>;
}

export interface IBusRouteService {
  createRoute(dto: CreateBusRouteDto): Promise<BusRouteDocument>;
  getAllRoutes(): Promise<BusRouteDocument[]>;
  getRouteById(id: string): Promise<BusRouteDocument>;
  updateRoute(id: string, dto: UpdateBusRouteDto): Promise<BusRouteDocument>;
  deleteRoute(id: string): Promise<void>;
  calculateFare(
    routeId: string,
    fromStopId: string,
    toStopId: string,
    numberOfSeats: number,
  ): Promise<number>;
}
