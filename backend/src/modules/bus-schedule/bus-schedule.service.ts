import { Inject, Injectable } from "@nestjs/common";
import { BUSSCHEDULE_REPOSITORY } from "src/modules/bus-schedule/bus-schedule.di-token";
import { IBusScheduleRepository, IBusScheduleService } from "src/modules/bus-schedule/bus-schedule.port";
import { BusScheduleDocument } from "src/modules/bus-schedule/bus-schedule.schema";
import { DRIVERSCHEDULE_SERVICE } from "src/modules/driver-schedule/driver-schedule.di-token";
import { ICreateDriverSchedule } from "src/modules/driver-schedule/driver-schedule.dto";
import { IDriverScheduleService } from "src/modules/driver-schedule/driver-schedule.port";

@Injectable()
export class BusScheduleService implements IBusScheduleService {
    constructor(
        @Inject(BUSSCHEDULE_REPOSITORY)
        private readonly busScheduleRepository: IBusScheduleRepository,
        @Inject(DRIVERSCHEDULE_SERVICE)
        private readonly driverScheduleService: IDriverScheduleService, // Replace with actual type
    ) { }

    async createBusSchedule(busRouteId: string, driverSchedules: ICreateDriverSchedule[]): Promise<BusScheduleDocument> {

        const busSchedule = await this.busScheduleRepository.createBusSchedule({
            busRouteId,
            driverSchedules,
        });
        return busSchedule;
    }

    async checkListDriverScheduleBusValid(driverSchedules: ICreateDriverSchedule[]): Promise<boolean> {
        // Implement your validation logic here
        await this.driverScheduleService.checkListDriverSchedule(driverSchedules);
        return true; // Placeholder return value
    }
}