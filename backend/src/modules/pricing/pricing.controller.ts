import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  HttpStatus,
  HttpCode,
  UseGuards,
  Inject,
  Put,
} from '@nestjs/common';
import {
  ICreateServiceConfigDto,
  ICreateVehiclePricingDto,
  ITestPriceDto,
  IUpdateServiceConfigDto,
  IUpdateVehiclePricingDto,
} from './pricing.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JoiValidationPipe } from 'src/common/pipes/joi.validation.pipe';
import { PricingValidation } from 'src/modules/pricing/validations/pricing.validation';
import { RolesGuard } from 'src/modules/auth/role.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { PRICING_SERVICE } from 'src/modules/pricing/pricing.di-token';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { IPricingService } from 'src/modules/pricing/pricing.port';

@ApiTags('pricing')
@Controller('pricing')
export class PricingController {
  constructor(
    @Inject(PRICING_SERVICE)
    private readonly pricingService: IPricingService,
  ) {}

  /* Service Config Endpoints */
  @Post('service-configs')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('authorization')
  @ApiOperation({ summary: 'Create a new service configuration' })
  @ApiBody({
    type: 'ICreateServiceConfigDto',
    description: 'Service configuration data',
    examples: {
      'Booking Hour Example': {
        value: {
          service_type: 'booking_hour',
          base_unit: 30,
          base_unit_type: 'minute',
        },
      },
      'Booking Trip Example': {
        value: {
          service_type: 'booking_trip',
          base_unit: 1,
          base_unit_type: 'km',
        },
      },
    },
  })
  async createServiceConfig(
    @Body(new JoiValidationPipe(PricingValidation.createServiceConfig))
    dto: ICreateServiceConfigDto,
  ) {
    try {
      return await this.pricingService.createServiceConfig(dto);
    } catch (error) {
      throw {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to create service config',
        error: error.message,
      };
    }
  }

  @Get('service-configs/:serviceType')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('authorization')
  @ApiOperation({ summary: 'Get service configuration by type' })
  @ApiParam({
    name: 'serviceType',
    description: 'Service type',
    example: 'booking_hour',
    enum: ['booking_hour', 'booking_trip', 'booking_share'],
  })
  async getServiceConfig(@Param('serviceType') serviceType: string) {
    const config = await this.pricingService.getServiceConfig(serviceType);
    if (!config) {
      throw {
        status: HttpStatus.NOT_FOUND,
        message: 'Service config not found',
      };
    }
    return config;
  }

  @Get('service-configs')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('authorization')
  @ApiOperation({ summary: 'Get all service configurations' })
  async listAllServiceConfigs() {
    return await this.pricingService.getAllServiceConfigs();
  }

  @Put('service-configs/:serviceType')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('authorization')
  @ApiOperation({ summary: 'Update service configuration base unit' })
  @ApiParam({
    name: 'serviceType',
    description: 'Service type',
    example: 'booking_hour',
    enum: ['booking_hour', 'booking_trip', 'booking_share'],
  })
  @ApiBody({
    type: 'IUpdateServiceConfigDto',
    description: 'Service configuration update data',
    examples: {
      'Update Base Unit': {
        value: {
          base_unit: 45,
        },
      },
    },
  })
  async updateServiceConfig(
    @Param('serviceType') serviceType: string,
    @Body(new JoiValidationPipe(PricingValidation.updateServiceConfig))
    dto: IUpdateServiceConfigDto,
  ) {
    try {
      const updated = await this.pricingService.updateServiceConfig(serviceType, dto);
      if (!updated) {
        throw {
          status: HttpStatus.NOT_FOUND,
          message: 'Service config not found',
        };
      }
      return updated;
    } catch (error) {
      if (error.status) throw error;
      throw {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to update service config',
        error: error.message,
      };
    }
  }

  /* Vehicle Pricing Endpoints */
  @Post('vehicle-pricings')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('authorization')
  @ApiOperation({ summary: 'Create vehicle pricing configuration' })
  @ApiBody({
    type: 'ICreateVehiclePricingDto',
    description: 'Vehicle pricing data',
    examples: {
      'Shuttle 4 Seats Example': {
        value: {
          vehicle_category: '65d34a5b7f1b2c4e8c8f8f8f',
          service_config: '65d34a5b7f1b2c4e8c8f8f8a',
          tiered_pricing: [
            { range: 0, price: 32000 },
            { range: 60, price: 28000 },
          ],
        },
      },
    },
  })
  async createVehiclePricing(
    @Body(new JoiValidationPipe(PricingValidation.createVehiclePricing))
    dto: ICreateVehiclePricingDto,
  ) {
    return await this.pricingService.createVehiclePricing(dto);
  }

  @Put('vehicle-pricings')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('authorization')
  @ApiOperation({ summary: 'Update vehicle pricing tiered pricing' })
  @ApiBody({
    type: 'IUpdateVehiclePricingDto',
    description: 'Vehicle pricing update data',
    examples: {
      'Update Tiered Pricing': {
        value: {
          vehicle_category: '67873bb9cf95c847fe62ba5f',
          service_config: '67a1bd9be372750e3a1f4178',
          tiered_pricing: [
            { range: 0, price: 35000 },
            { range: 60, price: 30000 },
          ],
        },
      },
    },
  })
  async updateVehiclePricing(
    @Body(new JoiValidationPipe(PricingValidation.updateVehiclePricing))
    dto: IUpdateVehiclePricingDto,
  ) {
    try {
      const updated = await this.pricingService.updateVehiclePricing(dto);
      if (!updated) {
        throw {
          status: HttpStatus.NOT_FOUND,
          message: 'Vehicle pricing not found',
        };
      }
      return updated;
    } catch (error) {
      if (error.status) throw error;
      throw {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to update vehicle pricing',
        error: error.message,
      };
    }
  }

  @Get('vehicle-pricings/:vehicleCategoryId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('authorization')
  @ApiOperation({ summary: 'Get vehicle pricing by category ID' })
  @ApiParam({
    name: 'vehicleCategoryId',
    description: 'Vehicle category ID',
    example: '65d34a5b7f1b2c4e8c8f8f8f',
  })
  async getVehiclePricing(@Param('vehicleCategoryId') vehicleId: string) {
    const pricing = await this.pricingService.getVehiclePricing(vehicleId);
    if (!pricing) {
      throw {
        status: HttpStatus.NOT_FOUND,
        message: 'Vehicle pricing not found',
      };
    }
    return pricing;
  }

  @Get('vehicle-pricings')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('authorization')
  @ApiOperation({ summary: 'Get all vehicle pricing configurations' })
  async listAllVehiclePricings() {
    return await this.pricingService.getAllVehiclePricings();
  }

  @Post('vehicle-pricings-test-price')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('authorization')
  @ApiOperation({ summary: 'For admin test price when update price' })
  @ApiBody({
    type: 'ICreateVehiclePricingDto',
    description: 'Vehicle pricing data',
    examples: {
      'Test Price': {
        value: {
          base_unit: 30,
          tiered_pricing: [
            { range: 0, price: 32000 },
            { range: 60, price: 28000 },
          ],
          total_units: 60,
        },
      },
    },
  })
  async testVehiclePricing(
    @Body(new JoiValidationPipe(PricingValidation.testPrice))
    dto: ITestPriceDto,
  ) {
    return await this.pricingService.testPrice(dto.base_unit, dto.tiered_pricing, dto.total_units);
  }
}
