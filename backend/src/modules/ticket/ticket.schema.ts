import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { TicketStatus } from 'src/share/enums/ticket.enum';

export type TicketDocument = HydratedDocument<Ticket>;
export type TripSeatDocument = HydratedDocument<TripSeat>;

@Schema({ collection: 'Tickets', timestamps: true })
export class Ticket {
  @Prop({ type: Types.ObjectId, ref: 'BusRoute', required: true })
  busRoute: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'BusTrip', required: true })
  busTrip: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'BusStop', required: true })
  fromStop: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'BusStop', required: true })
  toStop: Types.ObjectId;

  @Prop({ required: true, type: Number, min: 1 })
  numberOfSeats: number;

  @Prop({ required: true, type: Number })
  fare: number;

  @Prop({ required: true, type: Date })
  boardingTime: Date;

  @Prop({ type: Date })
  expectedDropOffTime: Date;

  @Prop({ 
    type: String,
    enum: Object.values(TicketStatus),
    default: TicketStatus.PENDING
  })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  passenger: Types.ObjectId;

  @Prop({ type: Object })
  passengerInfo: {
    name: string;
    phone?: string;
    email?: string;
  };
}

@Schema({ collection: 'TripSeats', timestamps: true })
export class TripSeat {
  @Prop({ type: Types.ObjectId, ref: 'BusTrip', required: true })
  busTrip: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'BusStop', required: true })
  fromStop: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'BusStop', required: true })
  toStop: Types.ObjectId;

  @Prop({ required: true, type: Number, default: 0 })
  seatsOccupied: number;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
export const TripSeatSchema = SchemaFactory.createForClass(TripSeat);

TicketSchema.index({ busTrip: 1, status: 1 });
TicketSchema.index({ fromStop: 1, toStop: 1 });
TicketSchema.index({ passenger: 1 });
TripSeatSchema.index({ busTrip: 1, fromStop: 1, toStop: 1 }, { unique: true });