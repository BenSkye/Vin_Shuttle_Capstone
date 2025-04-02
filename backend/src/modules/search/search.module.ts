import { forwardRef, Module } from '@nestjs/common';
import { DriverScheduleModule } from 'src/modules/driver-schedule/driver-schedule.module';
import { KeytokenModule } from 'src/modules/keytoken/keytoken.module';
import { PricingModule } from 'src/modules/pricing/pricing.module';
import { ScenicRouteModule } from 'src/modules/scenic-route/scenic-route.module';
import { SearchController } from 'src/modules/search/search.controller';
import { SEARCH_SERVICE } from 'src/modules/search/search.di-token';
import { SearchService } from 'src/modules/search/search.service';
import { TripModule } from 'src/modules/trip/trip.module';
import { VehicleCategoryModule } from 'src/modules/vehicle-categories/vehicle-category.module';
import { VehiclesModule } from 'src/modules/vehicles/vehicles.module';
import { ShareModule } from 'src/share/share.module';

const dependencies = [
  {
    provide: SEARCH_SERVICE,
    useClass: SearchService,
  },
  // {
  //     provide: BOOKING_REPOSITORY
  // }
];

@Module({
  imports: [
    VehiclesModule,
    VehicleCategoryModule,
    DriverScheduleModule,
    forwardRef(() => TripModule),
    PricingModule,
    ScenicRouteModule,
    ShareModule,
    KeytokenModule,
  ],
  controllers: [SearchController],
  providers: [...dependencies],
  exports: [...dependencies],
})
export class SearchModule { }
