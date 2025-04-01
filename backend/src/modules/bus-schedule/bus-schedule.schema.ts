import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BusTimeSlot, BusScheduleStatus } from '../../share/enums/bus-schedule.enum';

export type BusScheduleDocument = HydratedDocument<BusSchedule>;

@Schema({ _id: false })
class TimeSlotConfig {
  @Prop({ type: String, enum: BusTimeSlot, required: true })
  timeSlot: BusTimeSlot;

  @Prop({ type: Number, required: true, min: 1 })
  frequency: number; // number of trips in timeSlot

  @Prop({ type: [Types.ObjectId], ref: 'Vehicle', required: true })
  vehicles: Types.ObjectId[]; // list of vehicles running in this timeSlot
}

@Schema({ collection: 'BusSchedules', timestamps: true })
export class BusSchedule {
  @Prop({ type: Types.ObjectId, ref: 'BusRoute', required: true })
  busRoute: Types.ObjectId;

  @Prop({ type: [TimeSlotConfig], required: true })
  timeSlots: TimeSlotConfig[];

  @Prop({ 
    type: String, 
    enum: BusScheduleStatus,
    default: BusScheduleStatus.ACTIVE 
  })
  status: BusScheduleStatus;

  @Prop({ type: Date, required: true })
  effectiveDate: Date; // effective date of schedule

  @Prop({ type: Date })
  expiryDate: Date; // end date of schedule (optional)
}

export const BusScheduleSchema = SchemaFactory.createForClass(BusSchedule);