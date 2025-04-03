import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BusSchedule, BusScheduleSchema } from './bus-schedule.schema';
import { BusScheduleController } from './bus-schedule.controller';
import { BusScheduleService } from './bus-schedule.service';
import { BusScheduleRepository } from './bus-schedule.repo';
import { BUS_SCHEDULE_REPOSITORY, BUS_SCHEDULE_SERVICE } from './bus-schedule.di-token';
import { BusRouteModule } from '../bus-route/bus-route.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { KeytokenModule } from '../keytoken/keytoken.module'; 
import { ShareModule } from 'src/share/share.module';
import { DriverBusScheduleModule } from '../driver-bus-schedule/driver-bus-schedule.module';

const dependencies = [
  {
    provide: BUS_SCHEDULE_REPOSITORY,
    useClass: BusScheduleRepository,
  },
  {
    provide: BUS_SCHEDULE_SERVICE,
    useClass: BusScheduleService,
  },
];

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: BusSchedule.name,
        schema: BusScheduleSchema,
      },
    ]),
    BusRouteModule,
    VehiclesModule,
    KeytokenModule,
    ShareModule,
    DriverBusScheduleModule
  ],
  controllers: [BusScheduleController],
  providers: [...dependencies],
  exports: [...dependencies],
})
export class BusScheduleModule {}