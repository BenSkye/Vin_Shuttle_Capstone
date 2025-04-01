import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { DriverSchedule } from 'src/modules/driver-schedule/driver-schedule.schema';

export type BusScheduleDocument = HydratedDocument<BusSchedule>;
// 6-22
//6-12 tài xế A xe  A34
//11-18
//18-22
@Schema({ collection: 'BusSchedules', timestamps: true })
export class BusSchedule {
    @Prop({ type: Types.ObjectId, ref: 'BusRoutes', required: true })
    busRoute: Types.ObjectId;

    @Prop({ type: Date, required: true })
    date: Date;

    start: Date; //6 //6:15

    end: Date;//22 //22:15

    @Prop({ type: [Types.ObjectId], ref: 'DriverSchedules', default: [] })
    driverScheduleIds: Types.ObjectId[];

    @Prop({ type: Boolean })
    isValid: boolean; // Đánh dấu lịch trình có hợp lệ hay không

}

export const BusScheduleSchema = SchemaFactory.createForClass(BusSchedule);