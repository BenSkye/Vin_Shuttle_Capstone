import { ICreateBusScheduleDto, IUpdateBusScheduleDto } from "src/modules/bus-schedule/bus-schedule.dto";
import { BusScheduleDocument } from "src/modules/bus-schedule/bus-schedule.schema";
import { ICreateDriverSchedule } from "src/modules/driver-schedule/driver-schedule.dto";
import { QueryOptions } from "src/share/interface";

export interface IBusScheduleRepository {
    createBusSchedule(data: ICreateBusScheduleDto): Promise<BusScheduleDocument>;
    // updateBusSchedule(id: string, data: IUpdateBusScheduleDto): Promise<BusScheduleDocument>;
    // findBusSchedules(query: QueryOptions): Promise<BusScheduleDocument[]>;
    // findBusScheduleById(id: string): Promise<BusScheduleDocument>;
    // deleteBusSchedule(id: string): Promise<void>;
}

export interface IBusScheduleService {
    createBusSchedule(busRouteId: string, driverSchedules: ICreateDriverSchedule[]): Promise<BusScheduleDocument>;
    checkListDriverScheduleBusValid(driverSchedules: ICreateDriverSchedule[]): Promise<boolean>;
    // updateBusSchedule(id: string, busRouteId: string, driverSchedules: ICreateDriverSchedule[]): Promise<BusScheduleDocument>;
    // findBusSchedules(query: QueryOptions): Promise<BusScheduleDocument[]>;
    // findBusScheduleById(id: string): Promise<BusScheduleDocument>;
    // deleteBusSchedule(id: string): Promise<void>;
}