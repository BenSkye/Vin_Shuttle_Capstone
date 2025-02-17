
import { ICreateDriverSchedule, IUpdateDriverSchedule } from "src/modules/driver-schedule/driver-schedule.dto";
import { DriverSchedule } from "src/modules/driver-schedule/driver-schedule.schema";

export interface IDriverScheduleRepository {
    createDriverSchedule(driverSchedule: ICreateDriverSchedule): Promise<DriverSchedule>;
    getDriverScheduleById(id: string): Promise<DriverSchedule>;
    getAllDriverSchedules(): Promise<any>;
    getDriverSchedules(query: any, select: string[]): Promise<any>;
    findOneDriverSchedule(query: any, select: string[]): Promise<any>;
    updateDriverSchedule(id: string, driverSchedule: IUpdateDriverSchedule): Promise<DriverSchedule>;
}

export interface IDriverScheduleService {
    createDriverSchedule(driverSchedule: ICreateDriverSchedule): Promise<DriverSchedule>;
    createListDriverSchedule(driverSchedules: ICreateDriverSchedule[]): Promise<DriverSchedule[]>;
    checkListDriverSchedule(driverSchedules: ICreateDriverSchedule[]): Promise<boolean>;
    getDriverScheduleById(id: string): Promise<DriverSchedule>;
    getPersonalSchedulesFromStartToEnd(driverId: string, start: Date, end: Date): Promise<DriverSchedule[]>;
    getAllDriverSchedules(): Promise<any>;
    getDriverSchedules(query: any): Promise<any>;
    getScheduleFromStartToEnd(start: Date, end: Date): Promise<DriverSchedule[]>;
    updateDriverSchedule(id: string, driverSchedule: IUpdateDriverSchedule): Promise<DriverSchedule>;
    driverCheckIn(driverScheduleId: string, driverId: string): Promise<DriverSchedule>;
    driverCheckOut(driverScheduleId: string, driverId: string): Promise<DriverSchedule>;
}