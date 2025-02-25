import { BusStopDocument } from './bus-stop.schema';
import { CreateBusStopDto, UpdateBusStopDto } from './bus-stop.dto';

export interface IBusStopRepository {
  create(dto: CreateBusStopDto): Promise<BusStopDocument>;
  findAll(): Promise<BusStopDocument[]>;
  findById(id: string): Promise<BusStopDocument>;
  update(id: string, dto: UpdateBusStopDto): Promise<BusStopDocument>;
  delete(id: string): Promise<void>;
}

export interface IBusStopService {
  createBusStop(dto: CreateBusStopDto): Promise<BusStopDocument>;
  getAllBusStops(): Promise<BusStopDocument[]>;
  getBusStopById(id: string): Promise<BusStopDocument>;
  updateBusStop(id: string, dto: UpdateBusStopDto): Promise<BusStopDocument>;
  deleteBusStop(id: string): Promise<void>;
}
