import {
  driverScheduleParams,
  ICreateDriverSchedule,
  IUpdateDriverSchedule,
  PopulatedDriverScheduleDocument,
} from 'src/modules/driver-schedule/driver-schedule.dto';
import { DriverScheduleDocument } from 'src/modules/driver-schedule/driver-schedule.schema';
import { UserDocument } from 'src/modules/users/users.schema';
import { VehicleDocument } from 'src/modules/vehicles/vehicles.schema';
import { QueryOptions } from 'src/share/interface';

export interface IDriverScheduleRepository {
  createDriverSchedule(driverSchedule: ICreateDriverSchedule): Promise<DriverScheduleDocument>;
  getDriverScheduleById(id: string): Promise<DriverScheduleDocument>;
  getAllDriverSchedulesGeneral(): Promise<DriverScheduleDocument[]>;
  getDriverSchedules(query: any, select: string[], options?: QueryOptions): Promise<DriverScheduleDocument[]>;
  findOneDriverSchedule(query: any, select: string[]): Promise<PopulatedDriverScheduleDocument>;
  updateDriverSchedule(
    id: string,
    driverSchedule: IUpdateDriverSchedule,
  ): Promise<DriverScheduleDocument>;
}

export interface IDriverScheduleService {
  createDriverSchedule(driverSchedule: ICreateDriverSchedule): Promise<DriverScheduleDocument>;
  createListDriverSchedule(
    driverSchedules: ICreateDriverSchedule[],
  ): Promise<DriverScheduleDocument[]>;
  checkListDriverSchedule(driverSchedules: ICreateDriverSchedule[]): Promise<boolean>;

  getDriverNotScheduledInDate(date: Date): Promise<UserDocument[]>;
  getVehicleNotScheduledInDate(date: Date): Promise<VehicleDocument[]>;

  getDriverScheduleById(id: string): Promise<DriverScheduleDocument>;
  getPersonalSchedulesFromStartToEnd(
    driverId: string,
    start: Date,
    end: Date,
  ): Promise<DriverScheduleDocument[]>;
  getAllDriverSchedulesGeneral(): Promise<DriverScheduleDocument[]>;
  getDriverSchedules(query: driverScheduleParams): Promise<{
    driverSchedules: DriverScheduleDocument[],
    totalWorkingHours: number,
    actualWorkingHours: number
  }>
  getScheduleGeneralFromStartToEnd(start: Date, end: Date): Promise<DriverScheduleDocument[]>;
  updateDriverSchedule(
    id: string,
    driverSchedule: IUpdateDriverSchedule,
  ): Promise<DriverScheduleDocument>;
  cancelDriverSchedule(id: string): Promise<DriverScheduleDocument>;
  driverCheckIn(driverScheduleId: string, driverId: string): Promise<DriverScheduleDocument>;
  driverCheckOut(driverScheduleId: string, driverId: string): Promise<DriverScheduleDocument>;
  driverPauseSchedule(driverScheduleId: string, driverId: string, reason: string): Promise<DriverScheduleDocument>;
  driverContinueSchedule(driverScheduleId: string, driverId: string): Promise<DriverScheduleDocument>;

  autoCheckoutPendingSchedules(): Promise<void>;
}
