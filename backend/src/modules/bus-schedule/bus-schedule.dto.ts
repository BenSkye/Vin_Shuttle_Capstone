import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDate, IsEnum, IsMongoId, IsNumber, IsOptional, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BusTimeSlot } from 'src/share/enums/bus-schedule.enum';

export class TimeSlotConfigDto {
  @ApiProperty({
    enum: BusTimeSlot,
    example: BusTimeSlot.MORNING
  })
  @IsEnum(BusTimeSlot)
  timeSlot: BusTimeSlot;

  @ApiProperty({
    description: 'Số chuyến trong timeSlot',
    example: 4
  })
  @IsNumber()
  @Min(1)
  frequency: number;

  @ApiProperty({
    description: 'Danh sách ID xe',
    example: ['507f1f77bcf86cd799439011']
  })
  @IsArray()
  @IsMongoId({ each: true })
  vehicles: string[];
}

export class CreateBusScheduleDto {
  @ApiProperty({
    description: 'ID tuyến xe bus',
    example: '507f1f77bcf86cd799439011'
  })
  @IsMongoId()
  busRoute: string;

  @ApiProperty({
    type: [TimeSlotConfigDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotConfigDto)
  timeSlots: TimeSlotConfigDto[];

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
}