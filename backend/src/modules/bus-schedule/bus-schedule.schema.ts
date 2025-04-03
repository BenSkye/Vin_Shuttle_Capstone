import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BusScheduleStatus } from '../../share/enums/bus-schedule.enum';

export type BusScheduleDocument = HydratedDocument<BusSchedule>;

@Schema({ collection: 'BusSchedules', timestamps: true })
export class BusSchedule {
  @Prop({ type: Types.ObjectId, ref: 'BusRoute', required: true })
  busRoute: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Vehicle' }], required: true })
  vehicles: Types.ObjectId[]; // List of vehicles assigned to this route

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Driver' }], required: true })
  drivers: Types.ObjectId[];

  @Prop({ type: Number, required: true, min: 1 })
  tripsPerDay: number; // Number of trips to complete per day

  @Prop({ type: String, required: true })
  dailyStartTime: string; // Daily start time in HH:mm format (e.g. "06:00")

  @Prop({ type: String, required: true })
  dailyEndTime: string; // Daily end time in HH:mm format (e.g. "22:00")

  @Prop({ 
    type: String, 
    enum: BusScheduleStatus,
    default: BusScheduleStatus.ACTIVE 
  })
  status: BusScheduleStatus;

  @Prop({ type: Date, required: true })
  effectiveDate: Date; // Start date of schedule

  @Prop({ type: Date })
  expiryDate: Date; // End date of schedule (optional)

  @Prop({ type: [{ type: Object }] })
  driverAssignments: {
    driverId: Types.ObjectId;
    vehicleId: Types.ObjectId;
    startTime: Date;
    endTime: Date;
  }[];
}

export const BusScheduleSchema = SchemaFactory.createForClass(BusSchedule);