import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { OSR_SERVICE } from 'src/modules/OSR/osr.di-token';
import { RoutingOSRService } from 'src/modules/OSR/osr.service';
import { TrackingModule } from 'src/modules/tracking/tracking.module';
import { TripModule } from 'src/modules/trip/trip.module';

const dependencies = [
  {
    provide: OSR_SERVICE,
    useClass: RoutingOSRService,
  },
];

@Module({
  imports: [TrackingModule, forwardRef(() => TripModule), HttpModule],
  controllers: [],
  providers: [...dependencies],
  exports: [...dependencies],
})
export class OsrModule {}
