import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BusRoute, BusRouteDocument } from './bus-route.schema';
import { IBusRouteRepository, ICreateBusRouteData } from './bus-route.port';
import { UpdateBusRouteDto } from './bus-route.dto';

@Injectable()
export class BusRouteRepository implements IBusRouteRepository {
  constructor(
    @InjectModel(BusRoute.name)
    private readonly busRouteModel: Model<BusRoute>,
  ) {}

  async create(data: ICreateBusRouteData): Promise<BusRouteDocument> {
    const busRoute = new this.busRouteModel(data);
    return await busRoute.save();
  }

  async findAll(): Promise<BusRouteDocument[]> {
    return await this.busRouteModel
      .find()
      .populate('stops.stopId')
      .populate('vehicleCategory')
      .exec();
  }

  async findById(id: string): Promise<BusRouteDocument> {
    return await this.busRouteModel
      .findById(id)
      .populate([
        {
          path: 'stops.stopId',
          select: 'name position address'
        },
        {
          path: 'vehicleCategory',
          select: 'name description'
        }
      ])
      .exec();
  }

  async update(id: string, dto: UpdateBusRouteDto): Promise<BusRouteDocument> {
    return await this.busRouteModel
      .findByIdAndUpdate(id, dto, { new: true })
      .populate('stops.stopId')
      .populate('vehicleCategory')
      .exec();
  }

  async delete(id: string): Promise<void> {
    await this.busRouteModel.findByIdAndDelete(id).exec();
  }
}
