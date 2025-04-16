import { BusScheduleDocument } from './bus-schedule.schema';
import { CreateBusScheduleDto } from './bus-schedule.dto';

export interface IBusScheduleRepository {
  create(data: CreateBusScheduleDto): Promise<BusScheduleDocument>;
  findActiveByRoute(routeId: string, date?: string): Promise<BusScheduleDocument[]>;
  findById(id: string): Promise<BusScheduleDocument>;
  update(id: string, data: Partial<CreateBusScheduleDto>): Promise<BusScheduleDocument>;
  delete(id: string): Promise<void>;
}

export interface IBusScheduleService {
  createSchedule(dto: CreateBusScheduleDto): Promise<BusScheduleDocument>;
  getActiveScheduleByRoute(routeId: string, date?: string): Promise<any>;
  updateSchedule(id: string, dto: CreateBusScheduleDto): Promise<BusScheduleDocument>;
  deleteSchedule(id: string): Promise<void>;
  generateDailyTrips(scheduleId: string, date: Date): Promise<any>;
}