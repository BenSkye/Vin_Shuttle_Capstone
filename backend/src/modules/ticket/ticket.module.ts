import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TICKET_REPOSITORY, TICKET_SERVICE, TRIP_SEAT_REPOSITORY } from './ticket.di-token';
import { TicketController } from './ticket.controller';
import { TicketRepository } from './ticket.repo';
import { TripSeatRepository } from './trip-seat.repo';
import { TicketService } from './ticket.service';
import { Ticket, TicketSchema, TripSeat, TripSeatSchema } from './ticket.schema';
import { BusRouteModule } from '../bus-route/bus-route.module';
import { TicketGateway } from './ticket.gateway';
import { VehicleCategoryModule } from '../vehicle-categories/vehicle-category.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Ticket.name, schema: TicketSchema },
      { name: TripSeat.name, schema: TripSeatSchema },
    ]),
    BusRouteModule,
    VehicleCategoryModule
  ],
  controllers: [TicketController],
  providers: [
    {
      provide: TICKET_SERVICE,
      useClass: TicketService,
    },
    {
      provide: TICKET_REPOSITORY,
      useClass: TicketRepository,
    },
    {
      provide: TRIP_SEAT_REPOSITORY,
      useClass: TripSeatRepository,
    },
    TicketGateway,
  ],
  exports: [TICKET_SERVICE],
})
export class TicketModule {} 