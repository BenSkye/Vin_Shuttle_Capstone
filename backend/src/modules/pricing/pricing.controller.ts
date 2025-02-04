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
} from '@nestjs/common';
import {
    ICreateServiceConfigDto,
    ICreateVehiclePricingDto,
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
    constructor(@Inject(PRICING_SERVICE) private readonly pricingService: IPricingService) { }

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
                    base_unit_type: 'minute'
                }
            },
            'Booking Trip Example': {
                value: {
                    service_type: 'booking_trip',
                    base_unit: 1,
                    base_unit_type: 'km'
                }
            }
        }
    })
    async createServiceConfig(
        @Body(new JoiValidationPipe(PricingValidation.createServiceConfig))
        dto: ICreateServiceConfigDto
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
        enum: ['booking_hour', 'booking_trip', 'booking_share']
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
                        { range: 60, price: 28000 }
                    ]
                }
            }
        }
    })
    async createVehiclePricing(
        @Body(new JoiValidationPipe(PricingValidation.createVehiclePricing))
        dto: ICreateVehiclePricingDto
    ) {
        try {
            return await this.pricingService.createVehiclePricing(dto);
        } catch (error) {
            throw {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Failed to create vehicle pricing',
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
        example: '65d34a5b7f1b2c4e8c8f8f8f'
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

    /* Listing Endpoints */
    @Get('service-configs')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('authorization')
    @ApiOperation({ summary: 'Get all service configurations' })
    async listAllServiceConfigs() {
        return this.pricingService.getAllServiceConfigs();
    }

    @Get('vehicle-pricings')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('authorization')
    @ApiOperation({ summary: 'Get all vehicle pricing configurations' })
    async listAllVehiclePricings() {
        return this.pricingService.getAllVehiclePricings();
    }
}