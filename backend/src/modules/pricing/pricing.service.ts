import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
    PRICING_CONFIG_REPOSITORY,
    VEHICLE_PRICING_REPOSITORY
} from './pricing.di-token';
import {
    IPricingConfigRepository,
    IVehiclePricingRepository,
    IPricingService
} from './pricing.port';
import {
    ICreateServiceConfigDto,
    ICreateVehiclePricingDto,
    IUpdateServiceConfigDto,
    IUpdateVehiclePricingDto
} from './pricing.dto';

@Injectable()
export class PricingService implements IPricingService {
    constructor(
        @Inject(PRICING_CONFIG_REPOSITORY)
        private readonly configRepo: IPricingConfigRepository,
        @Inject(VEHICLE_PRICING_REPOSITORY)
        private readonly vehiclePricingRepo: IVehiclePricingRepository
    ) { }

    async createServiceConfig(config: ICreateServiceConfigDto) {
        const exists = await this.configRepo.findByServiceType(
            config.service_type
        );
        if (exists) {
            throw new HttpException({
                statusCode: HttpStatus.NOT_FOUND,
                message: 'Service config already exists'
            }, HttpStatus.NOT_FOUND);
        }
        const newServiceConfig = this.configRepo.create(config);
        return newServiceConfig;
    }

    async createVehiclePricing(pricing: ICreateVehiclePricingDto) {
        const vehicle_category = pricing.vehicle_category;
        const service_config = pricing.service_config;
        //check if vehicle pricing already exists with the same vehicle category and service config
        const exists = await this.vehiclePricingRepo.findVehiclePricing({ vehicle_category: vehicle_category, service_config: service_config });
        if (exists) {
            throw new HttpException({
                statusCode: HttpStatus.NOT_FOUND,
                message: 'Vehicle pricing already exists'
            }, HttpStatus.NOT_FOUND);
        }
        return this.vehiclePricingRepo.create(pricing);
    }

    async calculatePrice(serviceType: string, vehicleId: string) {
        const config = await this.configRepo.findByServiceType(serviceType);
        const pricing = await this.vehiclePricingRepo.findByVehicleCategory(vehicleId);

        if (!config || !pricing) {
            throw new HttpException('Config not found', HttpStatus.NOT_FOUND);
        }

        // Thêm logic tính toán ở đây
        return 0; // Thay bằng logic thực tế
    }


    async getServiceConfig(serviceType: string) {
        const config = await this.configRepo.findByServiceType(serviceType);
        if (!config) {
            throw new HttpException({
                statusCode: HttpStatus.NOT_FOUND,
                message: 'Service config not found'
            }, HttpStatus.NOT_FOUND);
        }
        return config;
    }

    async getVehiclePricing(vehicleId: string) {
        const pricing = await this.vehiclePricingRepo.findByVehicleCategory(vehicleId);
        if (!pricing) {
            throw new HttpException({
                statusCode: HttpStatus.NOT_FOUND,
                message: 'Vehicle pricing not found'
            }, HttpStatus.NOT_FOUND);
        }
        return pricing;
    }

    async getAllServiceConfigs() {
        return await this.configRepo.findAll();
    }

    async getAllVehiclePricings() {
        return await this.vehiclePricingRepo.findAll();
    }

    async updateServiceConfig(serviceType: string, config: IUpdateServiceConfigDto) {
        const exists = await this.configRepo.findByServiceType(serviceType);
        if (!exists) {
            throw new HttpException({
                statusCode: HttpStatus.NOT_FOUND,
                message: 'Service config not found'
            }, HttpStatus.NOT_FOUND);
        }
        return await this.configRepo.update(serviceType, config);
    }

    async updateVehiclePricing(pricing: IUpdateVehiclePricingDto) {
        const exists = await this.vehiclePricingRepo.findVehiclePricing({ vehicle_category: pricing.vehicle_category, service_config: pricing.service_config });
        if (!exists) {
            throw new HttpException({
                statusCode: HttpStatus.NOT_FOUND,
                message: 'Vehicle pricing not found'
            }, HttpStatus.NOT_FOUND);
        }
        return await this.vehiclePricingRepo.update(pricing);
    }
}