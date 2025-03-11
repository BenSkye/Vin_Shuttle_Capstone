import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PRICING_CONFIG_REPOSITORY, VEHICLE_PRICING_REPOSITORY } from './pricing.di-token';
import {
  IPricingConfigRepository,
  IVehiclePricingRepository,
  IPricingService,
} from './pricing.port';
import {
  ICreateServiceConfigDto,
  ICreateVehiclePricingDto,
  IUpdateServiceConfigDto,
  IUpdateVehiclePricingDto,
} from './pricing.dto';
import { VEHICLE_CATEGORY_REPOSITORY } from 'src/modules/vehicle-categories/vehicle-category.di-token';
import { IVehicleCategoryRepository } from 'src/modules/vehicle-categories/vehicle-category.port';

@Injectable()
export class PricingService implements IPricingService {
  constructor(
    @Inject(PRICING_CONFIG_REPOSITORY)
    private readonly configRepo: IPricingConfigRepository,
    @Inject(VEHICLE_PRICING_REPOSITORY)
    private readonly vehiclePricingRepo: IVehiclePricingRepository,
    @Inject(VEHICLE_CATEGORY_REPOSITORY)
    private readonly vehicleCategoryRepo: IVehicleCategoryRepository,
  ) { }

  async createServiceConfig(config: ICreateServiceConfigDto) {
    const exists = await this.configRepo.findByServiceType(config.service_type);
    if (exists) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Service config already exists',
          vnMessage: 'Cấu hình dịch vụ đã tồn tại',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const newServiceConfig = this.configRepo.create(config);
    return newServiceConfig;
  }

  async createVehiclePricing(pricing: ICreateVehiclePricingDto) {
    const vehicle_category = pricing.vehicle_category;
    const vehicle_category_exists = await this.vehicleCategoryRepo.getById(vehicle_category.toString());
    if (!vehicle_category_exists) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Vehicle category not found',
          vnMessage: 'Không tìm thấy loại xe',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const service_config = pricing.service_config;
    const service_config_exists = await this.configRepo.findById(service_config.toString());
    if (!service_config_exists) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Service config not found',
          vnMessage: 'Không tìm thấy cấu hình dịch vụ',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    //check if vehicle pricing already exists with the same vehicle category and service config
    const exists = await this.vehiclePricingRepo.findVehiclePricing({
      vehicle_category: vehicle_category,
      service_config: service_config,
    });
    if (exists) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Vehicle pricing already exists',
          vnMessage: 'Cấu hình giá đã tồn tại',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    //make sure that the tire_pricing is not empty and sorted by range
    const newVehiclePricing = await this.vehiclePricingRepo.create(pricing);
    if (!newVehiclePricing) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Vehicle pricing create failed',
          vnMessage: 'Tạo cấu hình giá thất bại',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return newVehiclePricing;
  }

  async getServiceConfig(serviceType: string) {
    const config = await this.configRepo.findByServiceType(serviceType);
    if (!config) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Service config not found',
          vnMessage: 'Không tìm thấy cấu hình dịch vụ',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return config;
  }

  async getVehiclePricing(vehicleId: string) {
    const pricing = await this.vehiclePricingRepo.findByVehicleCategory(vehicleId);
    if (!pricing) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Vehicle pricing not found',
          vnMessage: 'Không tìm thấy cấu hình giá',
        },
        HttpStatus.NOT_FOUND,
      );
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
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Service config not found',
          vnMessage: 'Không tìm thấy cấu hình dịch vụ',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return await this.configRepo.update(serviceType, config);
  }

  async updateVehiclePricing(pricing: IUpdateVehiclePricingDto) {
    const exists = await this.vehiclePricingRepo.findVehiclePricing({
      vehicle_category: pricing.vehicle_category,
      service_config: pricing.service_config,
    });
    if (!exists) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Vehicle pricing not found',
          vnMessage: 'Không tìm thấy cấu hình giá',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const updatedVehiclePricing = await this.vehiclePricingRepo.update(pricing);
    if (!updatedVehiclePricing) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Vehicle pricing update failed',
          vnMessage: 'Cập nhật cấu hình giá thất bại',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return updatedVehiclePricing
  }

  async checkVehicleCategoryAndServiceType(vehicleCategoryId: string, serviceType: string): Promise<boolean> {
    const vehicleCategory = await this.vehicleCategoryRepo.getById(vehicleCategoryId);
    if (!vehicleCategory) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Vehicle category not found',
          vnMessage: 'Không tìm thấy loại xe',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const serviceConfig = await this.configRepo.findByServiceType(serviceType);
    if (!serviceConfig) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Service config not found',
          vnMessage: 'Không tìm thấy cấu hình dịch vụ',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const vehiclePricing = await this.vehiclePricingRepo.findVehiclePricing({
      vehicle_category: vehicleCategory._id.toString(),
      service_config: serviceConfig._id.toString(),
    });
    if (!vehiclePricing) {
      return false;
    }
    return true;
  }

  //function to calculate price by hour or distance
  async calculatePrice(serviceType: string, vehicleCategoryId: string, totalUnits: number) {
    const config = await this.configRepo.findByServiceType(serviceType);
    if (!config) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Service config not found',
          vnMessage: 'Không tìm thấy cấu hình dịch vụ',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const pricing = await this.vehiclePricingRepo.findVehiclePricing({
      vehicle_category: vehicleCategoryId.toString(),
      service_config: config?._id.toString(),
    });
    if (!pricing) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Vehicle pricing not found',
          vnMessage: 'Không tìm thấy cấu hình giá',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    // Calculate total price using applicable pricing tiers
    const result = await this.recipePrice(config.base_unit, pricing.tiered_pricing, totalUnits);
    return result.totalPrice;
  }

  async testPrice(base_unit: number, tiered_pricing: Array<any>, totalUnits: number) {
    return await this.recipePrice(base_unit, tiered_pricing, totalUnits);
  }

  async recipePrice(base_unit, tiered_pricing, totalUnits) {
    const calculateArray = new Array<string>();
    const totalPrice = tiered_pricing
      .sort((a, b) => b.range - a.range) // Sort tiers by range in descending order
      .filter(tier => totalUnits >= tier.range) // Get applicable tiers
      .reduce((total, tier, _, tiers) => {
        const nextTierRange = tiers[tiers.indexOf(tier) + 1]?.range ?? 0;
        const unitsInTier = Math.min(totalUnits - nextTierRange, totalUnits - tier.range);
        totalUnits = totalUnits - unitsInTier;
        calculateArray.push(
          `${total} + ${unitsInTier} / ${base_unit} * ${tier.price} = ${Math.floor(total + (unitsInTier / base_unit) * tier.price)}`,
        );
        return Math.floor(total + (unitsInTier / base_unit) * tier.price);
      }, 0);

    return {
      totalPrice,
      calculations: calculateArray,
    };
  }
}
