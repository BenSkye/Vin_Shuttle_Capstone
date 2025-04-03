import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KeytokenModule } from 'src/modules/keytoken/keytoken.module';
import { OsrModule } from 'src/modules/OSR/osr.module';
import { SharedItineraryController } from 'src/modules/shared-itinerary/shared-itinerary.controller';
import {
  SHARE_ITINERARY_GATEWAY,
  SHARE_ITINERARY_REPOSITORY,
  SHARE_ITINERARY_SERVICE,
} from 'src/modules/shared-itinerary/shared-itinerary.di-token';
import { SharedItineraryGateway } from 'src/modules/shared-itinerary/shared-itinerary.gateway';
import { SharedItineraryRepository } from 'src/modules/shared-itinerary/shared-itinerary.repo';
import {
  SharedItinerary,
  SharedItinerarySchema,
} from 'src/modules/shared-itinerary/shared-itinerary.schema';
import { SharedItineraryService } from 'src/modules/shared-itinerary/shared-itinerary.service';
import { TrackingModule } from 'src/modules/tracking/tracking.module';
import { TripModule } from 'src/modules/trip/trip.module';
import { VehiclesModule } from 'src/modules/vehicles/vehicles.module';
import { ShareModule } from 'src/share/share.module';

const dependencies = [
  {
    provide: SHARE_ITINERARY_SERVICE,
    useClass: SharedItineraryService,
  },
  {
    provide: SHARE_ITINERARY_REPOSITORY,
    useClass: SharedItineraryRepository,
  },
  {
    provide: SHARE_ITINERARY_GATEWAY,
    useClass: SharedItineraryGateway,
  }
];

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SharedItinerary.name,
        schema: SharedItinerarySchema,
      },
    ]),
    KeytokenModule,
    OsrModule,
    ShareModule,
    forwardRef(() => TripModule),
    VehiclesModule,
    TrackingModule,
  ],
  controllers: [SharedItineraryController],
  providers: [...dependencies],
  exports: [...dependencies],
})
export class SharedItineraryModule { }
