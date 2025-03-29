import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BusRoute, BusRouteSchema } from './bus-route.schema';
import { BusRouteController } from './bus-route.controller';
import { BusRouteService } from './bus-route.service';
import { BusRouteRepository } from './bus-route.repo';
import { BUS_ROUTE_REPOSITORY, BUS_ROUTE_SERVICE } from './bus-route.di-token';
import { KeytokenModule } from '../keytoken/keytoken.module';
import { ShareModule } from 'src/share/share.module';
import { BusStopModule } from '../bus-stop/bus-stop.module';
import { PricingModule } from '../pricing/pricing.module';

const dependencies = [
  {
    provide: BUS_ROUTE_REPOSITORY,
    useClass: BusRouteRepository,
  },
  {
    provide: BUS_ROUTE_SERVICE,
    useClass: BusRouteService,
  },
];

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: BusRoute.name,
        schema: BusRouteSchema,
      },
    ]),
    BusStopModule,
    KeytokenModule,
    ShareModule,
    PricingModule,
  ],
  controllers: [BusRouteController],
  providers: [...dependencies],
  exports: [...dependencies],
})
export class BusRouteModule {}
