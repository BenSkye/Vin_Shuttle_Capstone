import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Route } from './route.schema';
import { CreateRouteDto, UpdateRouteDto } from './route.dto';
import { IRouteRepository } from 'src/modules/route/route.port';

@Injectable()
export class RouteRepository implements IRouteRepository {
    constructor(
        @InjectModel(Route.name) private readonly routeModel: Model<Route>
    ) { }

    async create(route: CreateRouteDto): Promise<Route> {
        const newRoute = new this.routeModel(route);
        return await newRoute.save();
    }

    async findById(id: string): Promise<Route | null> {
        return await this.routeModel.findById(id);
    }

    async find(query: any): Promise<Route | null> {
        return await this.routeModel.findOne(query);
    }

    async findAll(): Promise<Route[]> {
        return await this.routeModel.find();
    }

    async update(id: string, route: UpdateRouteDto): Promise<Route | null> {
        return await this.routeModel.findByIdAndUpdate(id, route, { new: true });
    }

    // async findByVehicleCategory(category: string): Promise<Route[]> {
    //     return await this.routeModel.find({ vehicleCategories: category });
    // }
}
