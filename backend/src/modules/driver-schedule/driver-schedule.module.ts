import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DriverScheduleController } from 'src/modules/driver-schedule/driver-schedule.controller';
import {
  DRIVERSCHEDULE_REPOSITORY,
  DRIVERSCHEDULE_SERVICE,
} from 'src/modules/driver-schedule/driver-schedule.di-token';
import { DriverScheduleRepository } from 'src/modules/driver-schedule/driver-schedule.repo';
import {
  DriverSchedule,
  DriverScheduleSchema,
} from 'src/modules/driver-schedule/driver-schedule.schema';
import { DriverScheduleService } from 'src/modules/driver-schedule/driver-schedule.service';
import { KeytokenModule } from 'src/modules/keytoken/keytoken.module';
import { UsersModule } from 'src/modules/users/users.module';
import { VehiclesModule } from 'src/modules/vehicles/vehicles.module';
import { ShareModule } from 'src/share/share.module';

const dependencies = [
  {
    provide: DRIVERSCHEDULE_REPOSITORY,
    useClass: DriverScheduleRepository,
  },
  {
    provide: DRIVERSCHEDULE_SERVICE,
    useClass: DriverScheduleService,
  },
];
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: DriverSchedule.name,
        schema: DriverScheduleSchema,
      },
    ]),
    UsersModule,
    VehiclesModule,
    ShareModule,
    KeytokenModule,
  ],
  controllers: [DriverScheduleController],
  providers: [...dependencies],
  exports: [...dependencies],
})
export class DriverScheduleModule {}
