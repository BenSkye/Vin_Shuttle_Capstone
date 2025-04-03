import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsMongoId, IsNumber, IsObject, IsOptional, IsEmail, Min, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { TicketStatus } from 'src/share/enums/ticket.enum';

export class PassengerInfoDto {
  @ApiProperty({
    description: 'Tên hành khách',
    example: 'Nguyen Van A'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Số điện thoại hành khách',
    example: '0123456789',
    required: false
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Email hành khách',
    example: 'example@email.com',
    required: false
  })
  @IsEmail()
  @IsOptional()
  email?: string;
}

export class CreateTicketDto {
  @ApiProperty({
    description: 'ID tuyến xe',
    example: '507f1f77bcf86cd799439011'
  })
  @IsMongoId()
  busRoute: string;

  @ApiProperty({
    description: 'ID chuyến xe',
    example: '507f1f77bcf86cd799439012'
  })
  @IsMongoId()
  busTrip: string;

  @ApiProperty({
    description: 'ID điểm lên xe',
    example: '507f1f77bcf86cd799439013'
  })
  @IsMongoId()
  fromStop: string;

  @ApiProperty({
    description: 'ID điểm xuống xe',
    example: '507f1f77bcf86cd799439014'
  })
  @IsMongoId()
  toStop: string;

  @ApiProperty({
    description: 'Số lượng ghế cần đặt',
    example: 2,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  numberOfSeats: number;

  @ApiProperty({
    description: 'Giá vé',
    example: 50000,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  fare: number;

  @ApiProperty({
    description: 'Thời gian lên xe',
    example: '2024-03-20T08:00:00.000Z'
  })
  @IsDate()
  @Type(() => Date)
  boardingTime: Date;

  @ApiProperty({
    description: 'Thời gian xuống xe dự kiến',
    example: '2024-03-20T09:00:00.000Z'
  })
  @IsDate()
  @Type(() => Date)
  expectedDropOffTime: Date;

  @ApiProperty({
    description: 'ID người dùng đặt vé',
    example: '507f1f77bcf86cd799439015'
  })
  @IsMongoId()
  passenger: string;

  @ApiProperty({
    description: 'Thông tin hành khách',
    type: PassengerInfoDto
  })
  @IsObject()
  @Type(() => PassengerInfoDto)
  passengerInfo: PassengerInfoDto;

  @ApiProperty({
    description: 'Trạng thái vé',
    enum: TicketStatus,
    default: TicketStatus.PENDING,
    required: false
  })
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;
}

export class UpdateTicketStatusDto {
  @ApiProperty({
    description: 'Trạng thái vé mới',
    enum: TicketStatus,
    example: TicketStatus.BOOKED
  })
  @IsEnum(TicketStatus)
  status: TicketStatus;
}

export class CheckAvailabilityDto {
  @ApiProperty({
    description: 'ID chuyến xe',
    example: '507f1f77bcf86cd799439012'
  })
  @IsMongoId()
  busTrip: string;

  @ApiProperty({
    description: 'ID điểm lên xe',
    example: '507f1f77bcf86cd799439013'
  })
  @IsMongoId()
  fromStop: string;

  @ApiProperty({
    description: 'ID điểm xuống xe',
    example: '507f1f77bcf86cd799439014'
  })
  @IsMongoId()
  toStop: string;

  @ApiProperty({
    description: 'Số lượng ghế cần kiểm tra',
    example: 2,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  seatsRequired: number;
} 