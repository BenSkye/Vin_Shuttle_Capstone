import { createDriverSchedule, updateDriverSchedule } from "src/modules/driver-schedule/driver-schedule.dto";
import { DriverSchedule } from "src/modules/driver-schedule/driver-schedule.schema";

export interface IDriverScheduleRepository {
    createDriverSchedule(driverSchedule: createDriverSchedule): Promise<DriverSchedule>;
    getDriverScheduleById(id: string): Promise<DriverSchedule>;
    getAllDriverSchedules(): Promise<any>;
    getDriverSchedules(query: any): Promise<any>;
    updateDriverSchedule(id: string, driverSchedule: updateDriverSchedule): Promise<DriverSchedule>;
}

export interface IDriverScheduleService {
    createDriverSchedule(driverSchedule: createDriverSchedule): Promise<DriverSchedule>;
    createListDriverSchedule(driverSchedules: createDriverSchedule[]): Promise<DriverSchedule[]>;
    getDriverScheduleById(id: string): Promise<DriverSchedule>;
    getAllDriverSchedules(): Promise<any>;
    getDriverSchedules(query: any): Promise<any>;
    updateDriverSchedule(id: string, driverSchedule: updateDriverSchedule): Promise<DriverSchedule>;
}