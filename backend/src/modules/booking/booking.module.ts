import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingController } from 'src/modules/booking/booking.controller';
import { BOOKING_REPOSITORY, BOOKING_SERVICE } from 'src/modules/booking/booking.di-token';
import { BookingRepository } from 'src/modules/booking/booking.repo';
import { Booking, BookingSchema } from 'src/modules/booking/booking.schema';
import { BookingService } from 'src/modules/booking/booking.service';
import { CheckoutModule } from 'src/modules/checkout/checkout.module';
import { ConversationModule } from 'src/modules/conversation/conversation.module';
import { DriverScheduleModule } from 'src/modules/driver-schedule/driver-schedule.module';
import { KeytokenModule } from 'src/modules/keytoken/keytoken.module';
import { NotificationModule } from 'src/modules/notification/notification.module';
import { PricingModule } from 'src/modules/pricing/pricing.module';
import { ScenicRouteModule } from 'src/modules/scenic-route/scenic-route.module';
import { SearchModule } from 'src/modules/search/search.module';
import { SharedItineraryModule } from 'src/modules/shared-itinerary/shared-itinerary.module';
import { TripModule } from 'src/modules/trip/trip.module';
import { VehicleCategoryModule } from 'src/modules/vehicle-categories/vehicle-category.module';
import { VehiclesModule } from 'src/modules/vehicles/vehicles.module';
import { ShareModule } from 'src/share/share.module';

const dependencies = [
  {
    provide: BOOKING_SERVICE,
    useClass: BookingService,
  },
  {
    provide: BOOKING_REPOSITORY,
    useClass: BookingRepository,
  },
];

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Booking.name,
        schema: BookingSchema,
      },
    ]),
    VehiclesModule,
    VehicleCategoryModule,
    DriverScheduleModule,
    TripModule,
    PricingModule,
    SearchModule,
    ScenicRouteModule,
    forwardRef(() => CheckoutModule),
    ShareModule,
    KeytokenModule,
    SharedItineraryModule,
    NotificationModule,
    ConversationModule,
  ],
  controllers: [BookingController],
  providers: [...dependencies],
  exports: [...dependencies],
})
export class BookingModule {}
