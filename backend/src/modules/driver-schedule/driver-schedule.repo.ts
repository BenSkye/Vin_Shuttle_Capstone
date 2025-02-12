import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IDriverScheduleRepository } from "src/modules/driver-schedule/driver-schedule.port";
import { DriverSchedule } from "src/modules/driver-schedule/driver-schedule.schema";
import { getSelectData } from "src/share/utils";


@Injectable()
export class DriverScheduleRepository implements IDriverScheduleRepository {
    constructor(
        @InjectModel(DriverSchedule.name) private readonly driverScheduleModel: Model<DriverSchedule>
    ) { }

    async createDriverSchedule(driverSchedule: any): Promise<DriverSchedule> {
        const newDriverSchedule = new this.driverScheduleModel(driverSchedule);
        return await newDriverSchedule.save();
    }

    async getDriverScheduleById(id: string): Promise<DriverSchedule> {
        return await this.driverScheduleModel.findById(id);
    }

    async getAllDriverSchedules(): Promise<any> {
        return await this.driverScheduleModel.find();
    }

    async getDriverSchedules(query: any, select: string[]): Promise<any> {
        return await this.driverScheduleModel.find(query).select(getSelectData(select));
    }

    async findOneDriverSchedule(query: any, select: string[]): Promise<any> {
        return await this.driverScheduleModel.findOne(query).select(getSelectData(select));
    }

    async updateDriverSchedule(id: string, driverSchedule: any): Promise<DriverSchedule> {
        return await this.driverScheduleModel.findByIdAndUpdate(id, driverSchedule, { new: true });
    }
}