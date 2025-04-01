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

  async findActiveByRoute(routeId: string): Promise<BusScheduleDocument> {
    const currentDate = new Date();

    return await this.busScheduleModel.findOne({
      busRoute: routeId,
      status: BusScheduleStatus.ACTIVE,
      effectiveDate: { $lte: new Date() },
      $or: [
      {
        effectiveDate: { $lte: currentDate },
        $or: [
          { expiryDate: { $gt: currentDate } },
          { expiryDate: null }
        ]
      },
      {
        effectiveDate: { $gt: currentDate }, 
        $or: [
          { expiryDate: { $gt: currentDate } },
          { expiryDate: null }
        ]
      }
    ]
    }).exec();
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