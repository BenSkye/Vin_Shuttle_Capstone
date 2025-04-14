import { DriverBusScheduleDocument } from './driver-bus-schedule.schema';
import { CreateDriverBusScheduleDto, UpdateDriverBusScheduleDto } from './driver-bus-schedule.dto';

export interface IDriverBusScheduleRepository {
  create(data: CreateDriverBusScheduleDto): Promise<DriverBusScheduleDocument>;
  findById(id: string): Promise<DriverBusScheduleDocument>;
  findByDriver(driverId: string): Promise<DriverBusScheduleDocument[]>;
  findByRoute(routeId: string): Promise<DriverBusScheduleDocument[]>;
  findByVehicle(vehicleId: string): Promise<DriverBusScheduleDocument[]>;
  findActiveByDriverAndDate(driverId: string, date: Date): Promise<DriverBusScheduleDocument[]>;
  update(id: string, data: UpdateDriverBusScheduleDto): Promise<DriverBusScheduleDocument>;
  delete(id: string): Promise<void>;
  find(filter: any): Promise<DriverBusScheduleDocument[]>;
  findConflictingSchedules(
    driverId: string,
    startTime: Date,
    endTime: Date,
    effectiveDate: Date
  ): Promise<DriverBusScheduleDocument[]>;
}

export interface IDriverBusScheduleService {
  createSchedule(dto: CreateDriverBusScheduleDto): Promise<DriverBusScheduleDocument>;
  getScheduleById(id: string): Promise<DriverBusScheduleDocument>;
  getDriverSchedules(driverId: string): Promise<DriverBusScheduleDocument[]>;
  getRouteSchedules(routeId: string): Promise<DriverBusScheduleDocument[]>;
  getVehicleSchedules(vehicleId: string): Promise<DriverBusScheduleDocument[]>;
  getActiveDriverSchedules(driverId: string, date: Date): Promise<DriverBusScheduleDocument[]>;
  updateSchedule(id: string, dto: UpdateDriverBusScheduleDto): Promise<DriverBusScheduleDocument>;
  deleteSchedule(id: string): Promise<void>;
  checkIn(id: string): Promise<DriverBusScheduleDocument>;
  checkOut(id: string): Promise<DriverBusScheduleDocument>;
  updateCurrentStop(id: string, stopId: string): Promise<DriverBusScheduleDocument>;
  updatePassengerCount(id: string, count: number): Promise<DriverBusScheduleDocument>;
  checkDriverAvailability(
    driverId: string,
    startTime: Date,
    endTime: Date,
    effectiveDate: Date
  ): Promise<boolean>;
} 