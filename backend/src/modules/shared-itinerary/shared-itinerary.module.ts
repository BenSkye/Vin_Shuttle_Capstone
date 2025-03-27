
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OsrModule } from 'src/modules/OSR/osr.module';
import { SharedItineraryController } from 'src/modules/shared-itinerary/share-itinerary.controller';
import { SHARE_ITINERARY_REPOSITORY, SHARE_ITINERARY_SERVICE } from 'src/modules/shared-itinerary/shared-itinerary.di-token';
import { SharedItineraryRepository } from 'src/modules/shared-itinerary/shared-itinerary.repo';
import { SharedItinerary, SharedItinerarySchema } from 'src/modules/shared-itinerary/shared-itinerary.schema';
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
];

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: SharedItinerary.name,
                schema: SharedItinerarySchema,
            },
        ]),
        OsrModule,
        ShareModule,
        forwardRef(() => TripModule),
        VehiclesModule,
        TrackingModule
    ],
    controllers: [SharedItineraryController],
    providers: [...dependencies],
    exports: [...dependencies],
})
export class SharedItineraryModule { }
