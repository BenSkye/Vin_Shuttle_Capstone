import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { DriverSchedulesStatus, DriverScheduleTaskType, Shift, ShiftHours } from 'src/share/enums';

export type DriverScheduleDocument = HydratedDocument<DriverSchedule>;

export class BreakTime {
  @Prop({ type: Date, required: true })
  startTime: Date;

  @Prop({ type: Date })
  endTime: Date;

  @Prop({ type: String, required: true })
  reason: string;
}

@Schema({ collection: 'DriverSchedules', timestamps: true })
export class DriverSchedule {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  driver: Types.ObjectId;

  @Prop({ type: Date, required: true })
  date: Date; // Ngày làm việc (ví dụ: 2023-10-01)

  @Prop({ type: String, enum: Shift, required: function () { return this.taskType === DriverScheduleTaskType.GENERAL; } })
  shift: string; // Ca làm việc (A, B, C, D)

  @Prop({ type: Number, default: 8 })
  totalWorkingHours: number; // Tổng số giờ làm việc trong ca (ví dụ: 8)

  @Prop({ type: Number, default: 0 })
  actualWorkingHours: number; // Số giờ làm việc thực tế của tài xế trong ca (ví dụ: 7.5)

  // @Prop({ type: Types.ObjectId, ref: 'BusRoutes', required: function () { return this.taskType === DriverScheduleTaskType.BUS; } })
  // busRoute: Types.ObjectId;

  // @Prop({ type: String, required: function () { return this.taskType === DriverScheduleTaskType.BUS; } })
  // startTime: Date; // Thời gian bắt đầu ca làm việc (ví dụ: 2023-10-01T08:00:00Z)

  // @Prop({ type: String, required: function () { return this.taskType === DriverScheduleTaskType.BUS; } })
  // endTime: Date; // Thời gian kết thúc ca làm việc (ví dụ: 2023-10-01T17:00:00Z)

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

  @Prop({ type: [BreakTime], default: [] })
  breakTimes: BreakTime[];
}

export const DriverScheduleSchema = SchemaFactory.createForClass(DriverSchedule);

DriverScheduleSchema.pre('save', function (next) {

  if (this.taskType === DriverScheduleTaskType.GENERAL && this.shift) {
    const shiftInfo = ShiftHours[this.shift as Shift];
    if (shiftInfo) {
      this.totalWorkingHours = shiftInfo.end - shiftInfo.start;
    }
  }
  console.log('this.checkinTime', this.checkinTime);
  console.log('this.checkoutTime', this.checkoutTime);
  if (this.checkinTime && this.checkoutTime && this.checkoutTime > this.checkinTime) {
    let totalBreakTimeMs = 0;

    this.breakTimes?.forEach(breakTime => {
      if (breakTime.startTime && breakTime.endTime && breakTime.endTime > breakTime.startTime) {
        totalBreakTimeMs += breakTime.endTime.getTime() - breakTime.startTime.getTime();
      }
    });
    // Calculate the difference in milliseconds
    const totalTimeMs = this.checkoutTime.getTime() - this.checkinTime.getTime();
    const actualWorkingTimeMs = totalTimeMs - totalBreakTimeMs;
    console.log('actualWorkingTimeMs', actualWorkingTimeMs);
    // Convert milliseconds to hours
    this.actualWorkingHours = parseFloat((actualWorkingTimeMs / (1000 * 60 * 60)).toFixed(2));

    // Check if the checkout is early compared to totalWorkingHours
    // if (this.actualWorkingHours < this.totalWorkingHours) {
    //   this.isEarlyCheckout = true;
    // } else {
    //   this.isEarlyCheckout = false;
    // }
  }

  next();
});