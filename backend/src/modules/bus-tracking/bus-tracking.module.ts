import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BusTracking, BusTrackingSchema } from './bus-tracking.schema';
import { BusTrackingService } from './bus-tracking.service';
import { BusTrackingController } from './bus-tracking.controller';
import { BusTrackingGateway } from './bus-tracking.gateway';
import { DriverBusScheduleModule } from '../driver-bus-schedule/driver-bus-schedule.module';
import { BusStopModule } from '../bus-stop/bus-stop.module';
import { BusRouteModule } from '../bus-route/bus-route.module';
import { KeytokenModule } from '../keytoken/keytoken.module';
import { ShareModule } from 'src/share/share.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BusTracking.name, schema: BusTrackingSchema },
    ]),
    DriverBusScheduleModule,
    BusStopModule,
    BusRouteModule,
    KeytokenModule,
    ShareModule
  ],
  controllers: [BusTrackingController],
  providers: [BusTrackingService, BusTrackingGateway],
  exports: [BusTrackingService],
})
export class BusTrackingModule {}