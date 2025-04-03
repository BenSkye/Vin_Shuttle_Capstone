import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DriverBusSchedule, DriverBusScheduleSchema } from './driver-bus-schedule.schema';
import { DriverBusScheduleController } from './driver-bus-schedule.controller';
import { DriverBusScheduleService } from './driver-bus-schedule.service';
import { DriverBusScheduleRepository } from './driver-bus-schedule.repo';
import { DRIVER_BUS_SCHEDULE_REPOSITORY, DRIVER_BUS_SCHEDULE_SERVICE } from './driver-bus-schedule.di-token';
import { BusRouteModule } from '../bus-route/bus-route.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { KeytokenModule } from '../keytoken/keytoken.module';
import { ShareModule } from 'src/share/share.module';

const dependencies = [
  {
    provide: DRIVER_BUS_SCHEDULE_REPOSITORY,
    useClass: DriverBusScheduleRepository,
  },
  {
    provide: DRIVER_BUS_SCHEDULE_SERVICE,
    useClass: DriverBusScheduleService,
  },
];

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: DriverBusSchedule.name,
        schema: DriverBusScheduleSchema,
      },
    ]),
    BusRouteModule,
    VehiclesModule,
    KeytokenModule,
    ShareModule,
  ],
  controllers: [DriverBusScheduleController],
  providers: [...dependencies],
  exports: [...dependencies],
})
export class DriverBusScheduleModule {} 