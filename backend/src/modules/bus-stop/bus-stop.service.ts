import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IBusStopService, IBusStopRepository } from './bus-stop.port';
import { BusStopDocument } from './bus-stop.schema';
import { CreateBusStopDto, UpdateBusStopDto } from './bus-stop.dto';
import { BUS_STOP_REPOSITORY } from './bus-stop.di-token';

@Injectable()
export class BusStopService implements IBusStopService {
  constructor(
    @Inject(BUS_STOP_REPOSITORY)
    private readonly busStopRepository: IBusStopRepository,
  ) {}

  async createBusStop(dto: CreateBusStopDto): Promise<BusStopDocument> {
    return await this.busStopRepository.create(dto);
  }

  async getAllBusStops(): Promise<BusStopDocument[]> {
    return await this.busStopRepository.findAll();
  }

  async getBusStopById(id: string): Promise<BusStopDocument> {
    const busStop = await this.busStopRepository.findById(id);
    if (!busStop) {
      throw new NotFoundException('Bus stop not found');
    }
    return busStop;
  }

  async updateBusStop(id: string, dto: UpdateBusStopDto): Promise<BusStopDocument> {
    const busStop = await this.busStopRepository.update(id, dto);
    if (!busStop) {
      throw new NotFoundException('Bus stop not found');
    }
    return busStop;
  }

  async deleteBusStop(id: string): Promise<void> {
    await this.getBusStopById(id);
    await this.busStopRepository.delete(id);
  }
}
