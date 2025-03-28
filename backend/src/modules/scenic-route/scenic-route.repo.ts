import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ScenicRoute, ScenicRouteDocument } from './scenic-route.schema';
import { ICreateScenicRouteDto, IUpdateScenicRouteDto } from './scenic-route.dto';
import { IScenicRouteRepository } from 'src/modules/scenic-route/scenic-route.port';
import { QueryOptions } from 'src/share/interface';
import { applyQueryOptions } from 'src/share/utils/query-params.util';

@Injectable()
export class ScenicRouteRepository implements IScenicRouteRepository {
  constructor(
    @InjectModel(ScenicRoute.name)
    private readonly routeModel: Model<ScenicRoute>,
  ) { }

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

  async findAll(
    query?: any,
    options?: QueryOptions,
  ): Promise<ScenicRouteDocument[]> {
    let queryBuilder;
    if (query) {
      queryBuilder = this.routeModel.find(query);
    } else {
      queryBuilder = this.routeModel.find();
    }
    queryBuilder = applyQueryOptions(queryBuilder, options);
    const result = await queryBuilder.exec();
    return result;
  }

  async update(id: string, route: IUpdateScenicRouteDto): Promise<ScenicRouteDocument | null> {
    return await this.routeModel.findByIdAndUpdate(id, route, { new: true });
  }

  // async findByVehicleCategory(category: string): Promise<ScenicRoute[]> {
  //     return await this.routeModel.find({ vehicleCategories: category });
  // }
}
