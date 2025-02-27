import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DriverScheduleModule } from 'src/modules/driver-schedule/driver-schedule.module';
import { KeytokenModule } from 'src/modules/keytoken/keytoken.module';
import { TripController } from 'src/modules/trip/trip.controller';
import { TRIP_GATEWAY, TRIP_REPOSITORY, TRIP_SERVICE } from 'src/modules/trip/trip.di-token';
import { TripRepository } from 'src/modules/trip/trip.repo';
import { Trip, TripSchema } from 'src/modules/trip/trip.schema';
import { TripService } from 'src/modules/trip/trip.service';
import { ShareModule } from 'src/share/share.module';
import { BusRouteModule } from '../bus-route/bus-route.module';
import { TripGateway } from 'src/modules/trip/trip.gateway';

const dependencies = [
  {
    provide: TRIP_REPOSITORY,
    useClass: TripRepository,
  },
  {
    provide: TRIP_SERVICE,
    useClass: TripService,
  },
  {
    provide: TRIP_GATEWAY,
    useClass: TripGateway,
  },
];

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Trip.name,
        schema: TripSchema,
      },
    ]),
    DriverScheduleModule,
    ShareModule,
    KeytokenModule,
    BusRouteModule,
  ],
  controllers: [TripController],
  providers: [...dependencies],
  exports: [...dependencies],
})
export class TripModule { }
