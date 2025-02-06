import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { KeytokenModule } from "src/modules/keytoken/keytoken.module";
import { TripController } from "src/modules/trips/trip.controller";
import { TRIP_REPOSITORY, TRIP_SERVICE } from "src/modules/trips/trip.di-token";
import { TripRepository } from "src/modules/trips/trip.repo";
import { Trip, TripSchema } from "src/modules/trips/trip.schema";
import { TripService } from "src/modules/trips/trip.service";
import { ShareModule } from "src/share/share.module";

const dependencies = [
    {
        provide: TRIP_REPOSITORY,
        useClass: TripRepository,
    },
    {
        provide: TRIP_SERVICE,
        useClass: TripService,
    }
]

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Trip.name, schema: TripSchema },
        ]),
        ShareModule,
        KeytokenModule
    ],
    controllers: [TripController],
    providers: [...dependencies],
    exports: [...dependencies]
})
export class TripModule { }