import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { BookingModule } from "src/modules/booking/booking.module";
import { BookingRepository } from "src/modules/booking/booking.repo";
import { KeytokenModule } from "src/modules/keytoken/keytoken.module";
import { RatingController } from "src/modules/rating/rating.controller";
import { RATING_REPOSITORY, RATING_SERVICE } from "src/modules/rating/rating.di-token";
import { RatingRepository } from "src/modules/rating/rating.repo";
import { Rating, RatingSchema } from "src/modules/rating/rating.schema";
import { RatingService } from "src/modules/rating/rating.service";
import { TripModule } from "src/modules/trip/trip.module";
import { ShareModule } from "src/share/share.module";

const dependencies = [
    {
        provide: RATING_SERVICE,
        useClass: RatingService,
    },
    {
        provide: RATING_REPOSITORY,
        useClass: RatingRepository,
    },
];

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Rating.name,
                schema: RatingSchema,
            },
        ]),
        TripModule,
        ShareModule,
        KeytokenModule,
    ],
    controllers: [RatingController],
    providers: [...dependencies],
    exports: [...dependencies],
})
export class RatingModule { }