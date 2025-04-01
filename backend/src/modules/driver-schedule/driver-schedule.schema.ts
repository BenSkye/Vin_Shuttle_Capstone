import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { DriverSchedulesStatus, DriverScheduleTaskType, Shift } from 'src/share/enums';

export type DriverScheduleDocument = HydratedDocument<DriverSchedule>;

@Schema({ collection: 'DriverSchedules', timestamps: true })
export class DriverSchedule {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  driver: Types.ObjectId;

  @Prop({ type: Date, required: true })
  date: Date; // Ngày làm việc (ví dụ: 2023-10-01)

  @Prop({ type: String, enum: Shift, required: function () { return this.taskType === DriverScheduleTaskType.GENERAL; } })
  shift: string; // Ca làm việc (A, B, C, D)

  @Prop({ type: Types.ObjectId, ref: 'BusRoutes', required: function () { return this.taskType === DriverScheduleTaskType.BUS; } })
  busRoute: Types.ObjectId;

  @Prop({ type: String, required: function () { return this.taskType === DriverScheduleTaskType.BUS; } })
  startTime: Date; // Thời gian bắt đầu ca làm việc (ví dụ: 2023-10-01T08:00:00Z)

  @Prop({ type: String, required: function () { return this.taskType === DriverScheduleTaskType.BUS; } })
  endTime: Date; // Thời gian kết thúc ca làm việc (ví dụ: 2023-10-01T17:00:00Z)

  @Prop({ type: Types.ObjectId, ref: 'Vehicle', required: true })
  vehicle: Types.ObjectId;

  @Prop({ type: String, enum: DriverSchedulesStatus, default: DriverSchedulesStatus.NOT_STARTED })
  status: string;

  @Prop({ type: Date })
  checkinTime: Date; // Thời gian checkin

  @Prop({ type: Date })
  checkoutTime: Date; // Thời gian checkout

  @Prop({ type: Boolean, default: false })
  isLate: boolean; // Đánh dấu tài xế checkin trễ

  @Prop({ type: Boolean, default: false })
  isEarlyCheckout: boolean; // Đánh dấu tài xế checkout sớm

  @Prop({ type: String, enum: DriverScheduleTaskType, required: true, default: DriverScheduleTaskType.GENERAL })
  taskType: string;
}

export const DriverScheduleSchema = SchemaFactory.createForClass(DriverSchedule);
