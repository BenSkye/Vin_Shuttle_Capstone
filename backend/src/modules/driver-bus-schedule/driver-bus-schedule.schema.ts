import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BusScheduleStatus } from '../../share/enums/bus-schedule.enum';

export type DriverBusScheduleDocument = HydratedDocument<DriverBusSchedule>;

@Schema({ collection: 'DriverBusSchedules', timestamps: true })
export class DriverBusSchedule {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  driver: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'BusRoute', required: true })
  busRoute: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Vehicle', required: true })
  vehicle: Types.ObjectId;

  @Prop({ type: Date, required: true })
  startTime: Date;

  @Prop({ type: Date, required: true })
  endTime: Date;

  @Prop({ type: Number, required: true })
  tripNumber: number; // Số thứ tự chuyến trong ngày

  @Prop({ type: String, enum: BusScheduleStatus, default: BusScheduleStatus.ACTIVE })
  status: BusScheduleStatus;

  @Prop({ type: Date })
  checkinTime: Date;

  @Prop({ type: Date })
  checkoutTime: Date;

  @Prop({ type: Boolean, default: false })
  isLate: boolean;

  @Prop({ type: Boolean, default: false })
  isEarlyCheckout: boolean;

  @Prop({ type: Number, default: 0 })
  currentPassengers: number;

  @Prop({ type: Number, default: 0 })
  totalPassengers: number;

  @Prop({ type: Types.ObjectId, ref: 'BusStop' })
  currentStop: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'BusStop' }], default: [] })
  completedStops: Types.ObjectId[];
}

export const DriverBusScheduleSchema = SchemaFactory.createForClass(DriverBusSchedule); 