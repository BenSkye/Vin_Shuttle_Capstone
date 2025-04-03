import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ICreateDriverSchedule, IUpdateDriverSchedule } from './driver-bus-schedule.dto';
import { IDriverBusScheduleRepository } from './driver-bus-schedule.port';
import { DriverBusSchedule, DriverBusScheduleDocument } from './driver-bus-schedule.schema';
import { BusScheduleStatus } from 'src/share/enums/bus-schedule.enum';

@Injectable()
export class DriverBusScheduleRepository implements IDriverBusScheduleRepository {
  constructor(
    @InjectModel(DriverBusSchedule.name)
    private readonly driverBusScheduleModel: Model<DriverBusSchedule>,
  ) {}

  async create(data: ICreateDriverSchedule): Promise<DriverBusScheduleDocument> {
    const schedule = new this.driverBusScheduleModel({
      ...data,
      driver: new Types.ObjectId(data.driver),
      busRoute: new Types.ObjectId(data.busRoute),
      vehicle: new Types.ObjectId(data.vehicle),
      status: BusScheduleStatus.ACTIVE
    });
    return await schedule.save();
  }

  async findById(id: string): Promise<DriverBusScheduleDocument> {
    return await this.driverBusScheduleModel
      .findById(id)
      .populate('driver', 'name')
      .populate('vehicle', 'name')
      .populate('busRoute')
      .populate('currentStop')
      .populate('completedStops');
  }

  async findByDriver(driverId: string): Promise<DriverBusScheduleDocument[]> {
    return await this.driverBusScheduleModel
      .find({ driver: new Types.ObjectId(driverId) })
      .populate('driver', 'name')
      .populate('vehicle', 'name')
      .populate('busRoute')
      .sort({ startTime: 1 });
  }

  async findByRoute(routeId: string): Promise<DriverBusScheduleDocument[]> {
    return await this.driverBusScheduleModel
      .find({ busRoute: new Types.ObjectId(routeId) })
      .populate('driver', 'name')
      .populate('vehicle', 'name')
      .populate('busRoute')
      .sort({ startTime: 1 });
  }

  async findByVehicle(vehicleId: string): Promise<DriverBusScheduleDocument[]> {
    return await this.driverBusScheduleModel
      .find({ vehicle: new Types.ObjectId(vehicleId) })
      .populate('driver', 'name')
      .populate('vehicle', 'name')
      .populate('busRoute')
      .sort({ startTime: 1 });
  }

  async findActiveByDriverAndDate(driverId: string, date: Date): Promise<DriverBusScheduleDocument[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await this.driverBusScheduleModel
      .find({
        driver: new Types.ObjectId(driverId),
        startTime: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: [BusScheduleStatus.ACTIVE, BusScheduleStatus.IN_PROGRESS] }
      })
      .populate('driver', 'name')
      .populate('vehicle', 'name')
      .populate('busRoute')
      .sort({ startTime: 1 });
  }

  async update(id: string, data: Partial<IUpdateDriverSchedule>): Promise<DriverBusScheduleDocument> {
    const updateData: any = { ...data };

    // Convert string IDs to ObjectIds
    if (data.currentStop) {
      updateData.currentStop = new Types.ObjectId(data.currentStop);
    }
    if (data.completedStops) {
      updateData.completedStops = data.completedStops.map(id => new Types.ObjectId(id));
    }

    return await this.driverBusScheduleModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('driver', 'name')
      .populate('vehicle', 'name')
      .populate('busRoute')
      .populate('currentStop')
      .populate('completedStops');
  }

  async delete(id: string): Promise<void> {
    await this.driverBusScheduleModel.findByIdAndDelete(id);
  }
} 