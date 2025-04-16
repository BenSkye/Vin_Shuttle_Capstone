import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ICreateDriverSchedule, IUpdateDriverSchedule, PopulatedDriverScheduleDocument } from 'src/modules/driver-schedule/driver-schedule.dto';
import { IDriverScheduleRepository } from 'src/modules/driver-schedule/driver-schedule.port';
import {
  DriverSchedule,
  DriverScheduleDocument,
} from 'src/modules/driver-schedule/driver-schedule.schema';
import { DriverScheduleTaskType } from 'src/share/enums';
import { QueryOptions } from 'src/share/interface';
import { getSelectData } from 'src/share/utils';
import { applyQueryOptions } from 'src/share/utils/query-params.util';

@Injectable()
export class DriverScheduleRepository implements IDriverScheduleRepository {
  constructor(
    @InjectModel(DriverSchedule.name) private readonly driverScheduleModel: Model<DriverSchedule>,
  ) { }

  async createDriverSchedule(driverSchedule: ICreateDriverSchedule): Promise<DriverScheduleDocument> {
    const newDriverSchedule = new this.driverScheduleModel(driverSchedule);
    return await newDriverSchedule.save();
  }

  async getDriverScheduleById(id: string): Promise<DriverScheduleDocument> {
    return await this.driverScheduleModel
      .findById(id)
      .populate('driver', 'name')
      .populate('vehicle', 'name');
  }

  async getAllDriverSchedulesGeneral(): Promise<DriverScheduleDocument[]> {
    return await this.driverScheduleModel
      .find({
        taskType: DriverScheduleTaskType.GENERAL,
      })
      .populate('driver', 'name')
      .populate('vehicle', 'name');
  }

  async getDriverSchedules(query: any, select: string[], options?: QueryOptions): Promise<DriverScheduleDocument[]> {
    let queryBuilder = this.driverScheduleModel
      .find(query)
      .select(getSelectData(select))
      .populate('driver', 'name')
      .populate('vehicle', 'name');
    queryBuilder = applyQueryOptions(queryBuilder, options);
    const result = await queryBuilder.exec();
    return result;
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

  async updateDriverSchedule(id: string, driverScheduleUpdateDto: IUpdateDriverSchedule): Promise<DriverScheduleDocument> {
    const driverSchedule = await this.driverScheduleModel.findById(id);
    if (!driverSchedule) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Driver schedule not found ${id}`,
          vnMessage: `Không tìm thấy thấy lịch tài xế ${id}`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    driverSchedule.set(driverScheduleUpdateDto);
    return await driverSchedule.save();
  }
}
