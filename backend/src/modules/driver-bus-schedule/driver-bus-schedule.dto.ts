import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDate, IsMongoId, IsOptional, IsNumber, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { BusScheduleStatus } from '../../share/enums/bus-schedule.enum';
import { Types } from 'mongoose';

export interface ICreateDriverSchedule {
  driver: string;
  busRoute: string;
  vehicle: string;
  startTime: Date;
  endTime: Date;
  tripNumber: number;
  status?: BusScheduleStatus;
}

export interface IUpdateDriverSchedule {
  driver?: string;
  busRoute?: string;
  vehicle?: string;
  startTime?: Date;
  endTime?: Date;
  status?: BusScheduleStatus;
  checkinTime?: Date;
  checkoutTime?: Date;
  isLate?: boolean;
  isEarlyCheckout?: boolean;
  currentStop?: Types.ObjectId;
  completedStops?: Types.ObjectId[];
  currentPassengers?: number;
  totalPassengers?: number;
}

export class CreateDriverBusScheduleDto implements ICreateDriverSchedule {
  @ApiProperty({
    description: 'Driver ID',
    example: '507f1f77bcf86cd799439011'
  })
  @IsMongoId()
  driver: string;

  @ApiProperty({
    description: 'Bus route ID',
    example: '507f1f77bcf86cd799439011'
  })
  @IsMongoId()
  busRoute: string;

  @ApiProperty({
    description: 'Vehicle ID',
    example: '507f1f77bcf86cd799439011'
  })
  @IsMongoId()
  vehicle: string;

  @ApiProperty({
    description: 'Start time of the schedule',
    example: '2024-03-20T08:00:00Z'
  })
  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @ApiProperty({
    description: 'End time of the schedule',
    example: '2024-03-20T17:00:00Z'
  })
  @IsDate()
  @Type(() => Date)
  endTime: Date;

  @ApiProperty({
    description: 'Số thứ tự chuyến trong ngày',
    example: 1
  })
  @IsNumber()
  tripNumber: number;

  @ApiProperty({
    description: 'Schedule status',
    enum: BusScheduleStatus,
    default: BusScheduleStatus.ACTIVE
  })
  @IsOptional()
  @IsEnum(BusScheduleStatus)
  status?: BusScheduleStatus;
}

export class UpdateDriverBusScheduleDto implements IUpdateDriverSchedule {
  @ApiProperty({
    description: 'Driver ID',
    required: false,
    example: '507f1f77bcf86cd799439011'
  })
  @IsOptional()
  @IsMongoId()
  driver?: string;

  @ApiProperty({
    description: 'Bus route ID',
    required: false,
    example: '507f1f77bcf86cd799439011'
  })
  @IsOptional()
  @IsMongoId()
  busRoute?: string;

  @ApiProperty({
    description: 'Vehicle ID',
    required: false,
    example: '507f1f77bcf86cd799439011'
  })
  @IsOptional()
  @IsMongoId()
  vehicle?: string;

  @ApiProperty({
    description: 'Start time',
    required: false,
    example: '2024-03-20T08:00:00Z'
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startTime?: Date;

  @ApiProperty({
    description: 'End time',
    required: false,
    example: '2024-03-20T17:00:00Z'
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endTime?: Date;

  @ApiProperty({
    description: 'Schedule status',
    required: false,
    enum: BusScheduleStatus,
    example: BusScheduleStatus.ACTIVE
  })
  @IsOptional()
  @IsEnum(BusScheduleStatus)
  status?: BusScheduleStatus;

  @ApiProperty({
    description: 'Check-in time',
    required: false
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  checkinTime?: Date;

  @ApiProperty({
    description: 'Check-out time',
    required: false
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  checkoutTime?: Date;

  @ApiProperty({
    description: 'Whether driver checked in late',
    required: false
  })
  @IsOptional()
  isLate?: boolean;

  @ApiProperty({
    description: 'Whether driver checked out early',
    required: false
  })
  @IsOptional()
  isEarlyCheckout?: boolean;

  @ApiProperty({
    description: 'Current stop ID',
    required: false
  })
  @IsOptional()
  @IsMongoId()
  currentStop?: Types.ObjectId;

  @ApiProperty({
    description: 'List of completed stop IDs',
    required: false
  })
  @IsOptional()
  completedStops?: Types.ObjectId[];

  @ApiProperty({
    description: 'Current number of passengers',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  currentPassengers?: number;

  @ApiProperty({
    description: 'Total number of passengers',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalPassengers?: number;
} 