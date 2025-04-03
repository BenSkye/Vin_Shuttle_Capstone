import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDate, IsEnum, IsMongoId, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { BusScheduleStatus } from 'src/share/enums/bus-schedule.enum';

export interface DriverAssignment {
  driverId: string;
  vehicleId: string;
  startTime: Date;
  endTime: Date;
}

export class CreateBusScheduleDto {
  @ApiProperty({
    description: 'ID tuyến xe bus',
    example: '507f1f77bcf86cd799439011'
  })
  @IsMongoId()
  busRoute: string;

  @ApiProperty({
    description: 'Danh sách ID xe được phân công cho tuyến',
    example: ['507f1f77bcf86cd799439011']
  })
  @IsArray()
  @IsMongoId({ each: true })
  vehicles: string[];

  @ApiProperty({
    description: 'Danh sách ID tài xế được phân công cho tuyến',
    example: ['507f1f77bcf86cd799439011']
  })
  @IsArray()
  @IsMongoId({ each: true })
  drivers: string[];

  @ApiProperty({
    description: 'Số chuyến mỗi ngày',
    example: 12
  })
  @IsNumber()
  @Min(1)
  tripsPerDay: number;

  @ApiProperty({
    description: 'Thời gian bắt đầu trong ngày (HH:mm)',
    example: '06:00'
  })
  @IsString()
  dailyStartTime: string;

  @ApiProperty({
    description: 'Thời gian kết thúc trong ngày (HH:mm)',
    example: '22:00'
  })
  @IsString()
  dailyEndTime: string;

  @ApiProperty({
    description: 'Ngày bắt đầu áp dụng',
    example: '2024-03-20'
  })
  @IsDate()
  @Type(() => Date)
  effectiveDate: Date;

  @ApiProperty({
    description: 'Ngày kết thúc',
    required: false,
    example: '2024-12-31'
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiryDate?: Date;

  @ApiProperty({
    description: 'Trạng thái lịch trình',
    enum: BusScheduleStatus,
    default: BusScheduleStatus.ACTIVE
  })
  @IsOptional()
  @IsEnum(BusScheduleStatus)
  status?: BusScheduleStatus;

  @ApiProperty({
    description: 'Danh sách phân công tài xế-xe cho lịch trình. Mỗi phần tử chứa thông tin về tài xế (driverId), xe được phân công (vehicleId), thời gian bắt đầu và kết thúc ca làm việc.',
    type: [Object],
    required: false,
    example: [{
      driverId: '507f1f77bcf86cd799439011',
      vehicleId: '507f1f77bcf86cd799439012',
      startTime: '2024-03-20T06:00:00.000Z',
      endTime: '2024-03-20T14:00:00.000Z'
    }]
  })
  @IsOptional()
  @IsArray()
  driverAssignments?: DriverAssignment[];
}

export interface GeneratedBusTrip {
  busRoute: string;
  vehicle: string;
  driver: string;
  startTime: Date;
  endTime: Date;
  estimatedDuration: number;
  status: BusScheduleStatus;
}