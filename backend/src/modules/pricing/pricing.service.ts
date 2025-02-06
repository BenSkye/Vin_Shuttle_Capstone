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
        const vehicle_category_exists = await this.vehiclePricingRepo.findByVehicleCategory(vehicle_category);
        if (!vehicle_category_exists) {
            throw new HttpException({
                statusCode: HttpStatus.NOT_FOUND,
                message: 'Vehicle category not found'
            }, HttpStatus.NOT_FOUND);
        }
        const service_config = pricing.service_config;
        const service_config_exists = await this.configRepo.findByServiceType(service_config);
        if (!service_config_exists) {
            throw new HttpException({
                statusCode: HttpStatus.NOT_FOUND,
                message: 'Service config not found'
            }, HttpStatus.NOT_FOUND);
        }
        //check if vehicle pricing already exists with the same vehicle category and service config
        const exists = await this.vehiclePricingRepo.findVehiclePricing({ vehicle_category: vehicle_category, service_config: service_config });
        if (exists) {
            throw new HttpException({
                statusCode: HttpStatus.NOT_FOUND,
                message: 'Vehicle pricing already exists'
            }, HttpStatus.NOT_FOUND);
        }
        //make sure that the tire_pricing is not empty and sorted by range
        return this.vehiclePricingRepo.create(pricing);
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


    //function to calculate price by hour or distance
    async calculatePrice(serviceType: string, vehicleId: string, totalUnits: number) {
        // Get service configuration and vehicle pricing
        const [config, pricing] = await Promise.all([
            this.configRepo.findByServiceType(serviceType),
            this.vehiclePricingRepo.findVehiclePricing({
                vehicle_category: vehicleId,
                service_config: (await this.configRepo.findByServiceType(serviceType))?._id
            })
        ]);

        if (!config || !pricing) {
            throw new HttpException({
                statusCode: HttpStatus.NOT_FOUND,
                message: !config ? 'Service config not found' : 'Vehicle pricing not found'
            }, HttpStatus.NOT_FOUND);
        }

        // Calculate total price using applicable pricing tiers
        const { base_unit, tiered_pricing } = { base_unit: config.base_unit, tiered_pricing: pricing.tiered_pricing };
        return tiered_pricing
            .sort((a, b) => b.range - a.range) // Sort tiers by range in descending order
            .filter(tier => totalUnits >= tier.range) // Get applicable tiers
            .reduce((total, tier, _, tiers) => {
                const nextTierRange = tiers[tiers.indexOf(tier) + 1]?.range ?? 0;
                const unitsInTier = Math.min(totalUnits - nextTierRange, totalUnits - tier.range);
                totalUnits = totalUnits - unitsInTier;
                return total + (unitsInTier / base_unit) * tier.price;
            }, 0);
    }

}
