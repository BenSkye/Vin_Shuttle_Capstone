import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IPricingConfigRepository } from './pricing.port';
import { ServiceConfig, ServiceConfigDocument } from './pricing.config.schema';
import { ICreateServiceConfigDto } from './pricing.dto';

@Injectable()
export class PricingConfigRepository implements IPricingConfigRepository {
  constructor(
    @InjectModel(ServiceConfig.name)
    private readonly configModel: Model<ServiceConfigDocument>,
  ) {}

  async create(config: ICreateServiceConfigDto): Promise<ServiceConfigDocument> {
    return await this.configModel.create(config);
  }

  async findByServiceType(serviceType: string): Promise<ServiceConfigDocument> {
    return await this.configModel.findOne({ service_type: serviceType }).exec();
  }

  async findAll(): Promise<ServiceConfigDocument[]> {
    return await this.configModel.find().exec();
  }

  async findById(id: string): Promise<ServiceConfigDocument> {
    return await this.configModel.findById(id);
  }

  async update(
    serviceType: string,
    config: ICreateServiceConfigDto,
  ): Promise<ServiceConfigDocument> {
    return await this.configModel
      .findOneAndUpdate({ service_type: serviceType }, config, { new: true })
      .exec();
  }
}
