import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BusStop, BusStopDocument } from './bus-stop.schema';
import { IBusStopRepository } from './bus-stop.port';
import { CreateBusStopDto, UpdateBusStopDto } from './bus-stop.dto';

@Injectable()
export class BusStopRepository implements IBusStopRepository {
    constructor(
        @InjectModel(BusStop.name)
        private readonly busStopModel: Model<BusStop>
    ) {}

    async create(dto: CreateBusStopDto): Promise<BusStopDocument> {
        const busStop = new this.busStopModel(dto);
        return await busStop.save();
    }

    async findAll(): Promise<BusStopDocument[]> {
        return await this.busStopModel.find().exec();
    }

    async findById(id: string): Promise<BusStopDocument> {
        return await this.busStopModel.findById(id).exec();
    }

    async update(id: string, dto: UpdateBusStopDto): Promise<BusStopDocument> {
        return await this.busStopModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    }

    async delete(id: string): Promise<void> {
        await this.busStopModel.findByIdAndDelete(id).exec();
    }
}