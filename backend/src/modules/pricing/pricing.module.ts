import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PricingController } from './pricing.controller';
import { PricingService } from './pricing.service';
import {
    PRICING_CONFIG_REPOSITORY,
    PRICING_SERVICE,
    VEHICLE_PRICING_REPOSITORY
} from './pricing.di-token';
import {
    PricingConfigRepository,
} from './pricing.config.repo';
import { VehiclePricingRepository } from 'src/modules/pricing/pricing.vehicle.repo';
import {
    ServiceConfig,
    ServiceConfigSchema,
} from './pricing.config.schema'; // Giả sử schema được combine
import { VehiclePricing, VehiclePricingSchema } from 'src/modules/pricing/pricing.vehicle.schema';
import { ShareModule } from 'src/share/share.module';
import { KeytokenModule } from 'src/modules/keytoken/keytoken.module';


const dependencies = [
    {
        provide: PRICING_CONFIG_REPOSITORY,
        useClass: PricingConfigRepository,
    },
    {
        provide: VEHICLE_PRICING_REPOSITORY,
        useClass: VehiclePricingRepository,
    },
    {
        provide: PRICING_SERVICE,
        useClass: PricingService,
    },
]

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: ServiceConfig.name, schema: ServiceConfigSchema },
            { name: VehiclePricing.name, schema: VehiclePricingSchema }
        ]),
        ShareModule,
        KeytokenModule
    ],
    controllers: [PricingController],
    providers: [...dependencies],
    exports: [...dependencies]
})
export class PricingModule { }