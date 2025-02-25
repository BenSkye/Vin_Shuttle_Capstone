import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ScenicRoute, ScenicRouteDocument } from './scenic-route.schema';
import { ICreateScenicRouteDto, IUpdateScenicRouteDto } from './scenic-route.dto';
import { IScenicRouteRepository } from 'src/modules/scenic-route/scenic-route.port';

@Injectable()
export class ScenicRouteRepository implements IScenicRouteRepository {
  constructor(
    @InjectModel(ScenicRoute.name)
    private readonly routeModel: Model<ScenicRoute>,
  ) {}

  async create(route: ICreateScenicRouteDto): Promise<ScenicRouteDocument> {
    const newScenicRoute = new this.routeModel(route);
    return await newScenicRoute.save();
  }

  async findById(id: string): Promise<ScenicRouteDocument | null> {
    return await this.routeModel.findById(id);
  }

  async find(query: any): Promise<ScenicRouteDocument | null> {
    return await this.routeModel.findOne(query);
  }

  async findAll(): Promise<ScenicRouteDocument[]> {
    return await this.routeModel.find();
  }

  async update(id: string, route: IUpdateScenicRouteDto): Promise<ScenicRouteDocument | null> {
    return await this.routeModel.findByIdAndUpdate(id, route, { new: true });
  }

  // async findByVehicleCategory(category: string): Promise<ScenicRoute[]> {
  //     return await this.routeModel.find({ vehicleCategories: category });
  // }
}
