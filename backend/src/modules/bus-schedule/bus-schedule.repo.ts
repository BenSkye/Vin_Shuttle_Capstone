import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ICreateBusScheduleDto } from "src/modules/bus-schedule/bus-schedule.dto";
import { IBusScheduleRepository } from "src/modules/bus-schedule/bus-schedule.port";
import { BusSchedule, BusScheduleDocument } from "src/modules/bus-schedule/bus-schedule.schema";


@Injectable()
export class BusScheduleRepository implements IBusScheduleRepository {
    constructor(
        @InjectModel(BusSchedule.name) private readonly busScheduleModel: Model<BusSchedule>,
    ) { }

    async createBusSchedule(data: ICreateBusScheduleDto): Promise<BusScheduleDocument> {
        const busSchedule = new this.busScheduleModel(data);
        return busSchedule.save();
    }
}