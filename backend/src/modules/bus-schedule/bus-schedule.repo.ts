import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BusSchedule, BusScheduleDocument } from './bus-schedule.schema';
import { IBusScheduleRepository } from './bus-schedule.port';
import { CreateBusScheduleDto } from './bus-schedule.dto';
import { BusScheduleStatus } from 'src/share/enums/bus-schedule.enum';

@Injectable()
export class BusScheduleRepository implements IBusScheduleRepository {
  constructor(
    @InjectModel(BusSchedule.name)
    private readonly busScheduleModel: Model<BusSchedule>,
  ) {}

  async create(data: CreateBusScheduleDto): Promise<BusScheduleDocument> {
    const schedule = new this.busScheduleModel(data);
    return await schedule.save();
  }

  async findActiveByRoute(routeId: string): Promise<any> {
  const currentDate = new Date();

  const schedule = await this.busScheduleModel
    .findOne({
      busRoute: routeId,
      status: BusScheduleStatus.ACTIVE,
      effectiveDate: { $lte: currentDate },
      $or: [
        { expiryDate: { $gt: currentDate } },
        { expiryDate: null }
      ]
    })
    .populate([
      {
        path: 'busRoute',
        select: 'name description stops distance estimatedTime'
      },
      {
        path: 'vehicles',
        select: 'name plateNumber type operationStatus'
      },
      {
        path: 'drivers',
        select: 'fullName phone email'
      }
    ])
    .lean()
    .exec();

  return schedule;
}

  async findById(id: string): Promise<BusScheduleDocument> {
    return await this.busScheduleModel.findById(id).exec();
  }

  async update(id: string, data: Partial<CreateBusScheduleDto>): Promise<BusScheduleDocument> {
    return await this.busScheduleModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
  }

  async delete(id: string): Promise<void> {
    await this.busScheduleModel.findByIdAndDelete(id).exec();
  }
} 