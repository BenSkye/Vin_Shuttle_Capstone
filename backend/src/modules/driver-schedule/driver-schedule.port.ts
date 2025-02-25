
import { ICreateDriverSchedule, IUpdateDriverSchedule } from "src/modules/driver-schedule/driver-schedule.dto";
import { DriverScheduleDocument } from "src/modules/driver-schedule/driver-schedule.schema";

export interface IDriverScheduleRepository {
    createDriverSchedule(driverSchedule: ICreateDriverSchedule): Promise<DriverScheduleDocument>;
    getDriverScheduleById(id: string): Promise<DriverScheduleDocument>;
    getAllDriverSchedules(): Promise<DriverScheduleDocument[]>;
    getDriverSchedules(query: any, select: string[]): Promise<DriverScheduleDocument[]>;
    findOneDriverSchedule(query: any, select: string[]): Promise<DriverScheduleDocument>;
    updateDriverSchedule(id: string, driverSchedule: IUpdateDriverSchedule): Promise<DriverScheduleDocument>;
}

export interface IDriverScheduleService {
    createDriverSchedule(driverSchedule: ICreateDriverSchedule): Promise<DriverScheduleDocument>;
    createListDriverSchedule(driverSchedules: ICreateDriverSchedule[]): Promise<DriverScheduleDocument[]>;
    checkListDriverSchedule(driverSchedules: ICreateDriverSchedule[]): Promise<boolean>;
    getDriverScheduleById(id: string): Promise<DriverScheduleDocument>;
    getPersonalSchedulesFromStartToEnd(driverId: string, start: Date, end: Date): Promise<DriverScheduleDocument[]>;
    getAllDriverSchedules(): Promise<DriverScheduleDocument[]>;
    getDriverSchedules(query: any): Promise<DriverScheduleDocument[]>;
    getScheduleFromStartToEnd(start: Date, end: Date): Promise<DriverScheduleDocument[]>;
    updateDriverSchedule(id: string, driverSchedule: IUpdateDriverSchedule): Promise<DriverScheduleDocument>;
    driverCheckIn(driverScheduleId: string, driverId: string): Promise<DriverScheduleDocument>;
    driverCheckOut(driverScheduleId: string, driverId: string): Promise<DriverScheduleDocument>;
}