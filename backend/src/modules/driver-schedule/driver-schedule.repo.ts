import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PopulatedDriverScheduleDocument } from 'src/modules/driver-schedule/driver-schedule.dto';
import { IDriverScheduleRepository } from 'src/modules/driver-schedule/driver-schedule.port';
import {
  DriverSchedule,
  DriverScheduleDocument,
} from 'src/modules/driver-schedule/driver-schedule.schema';
import { getSelectData } from 'src/share/utils';

@Injectable()
export class DriverScheduleRepository implements IDriverScheduleRepository {
  constructor(
    @InjectModel(DriverSchedule.name) private readonly driverScheduleModel: Model<DriverSchedule>,
  ) {}

  async createDriverSchedule(driverSchedule: any): Promise<DriverScheduleDocument> {
    const newDriverSchedule = new this.driverScheduleModel(driverSchedule);
    return await newDriverSchedule.save();
  }

  async getDriverScheduleById(id: string): Promise<DriverScheduleDocument> {
    return await this.driverScheduleModel
      .findById(id)
      .populate('driver', 'name')
      .populate('vehicle', 'name');
  }

  async getAllDriverSchedules(): Promise<DriverScheduleDocument[]> {
    return await this.driverScheduleModel
      .find()
      .populate('driver', 'name')
      .populate('vehicle', 'name');
  }

  async getDriverSchedules(query: any, select: string[]): Promise<DriverScheduleDocument[]> {
    return await this.driverScheduleModel
      .find(query)
      .select(getSelectData(select))
      .populate('driver', 'name')
      .populate('vehicle', 'name');
  }

  async findOneDriverSchedule(
    query: any,
    select: string[],
  ): Promise<PopulatedDriverScheduleDocument> {
    return await this.driverScheduleModel
      .findOne(query)
      .select(getSelectData(select))
      .populate('driver', 'name')
      .populate('vehicle', 'name');
  }

  async updateDriverSchedule(id: string, driverSchedule: any): Promise<DriverScheduleDocument> {
    return await this.driverScheduleModel.findByIdAndUpdate(id, driverSchedule, { new: true });
  }
}
