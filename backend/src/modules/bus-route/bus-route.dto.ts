import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsEnum,
  IsMongoId,
  ValidateNested,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PositionDto {
  @ApiProperty({
    description: 'Latitude coordinate',
    example: 21.028511,
  })
  @IsNumber()
  lat: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: 105.804817,
  })
  @IsNumber()
  lng: number;
}

export class RouteStopDto {
  @ApiProperty({
    description: 'Bus stop ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsNotEmpty({ message: 'Stop ID is required' })
  @IsMongoId({ message: 'Stop ID must be a valid MongoDB ObjectId' })
  stopId: string;

  @ApiProperty({
    description: 'Order index of the stop in route',
    example: 1,
  })
  @IsNumber()
  @Min(0)
  orderIndex: number;

  @ApiProperty({
    description: 'Distance from start point (km)',
    example: 5.2,
  })
  @IsNumber()
  @Min(0)
  distanceFromStart: number;

  @ApiProperty({
    description: 'Estimated time from start point (minutes)',
    example: 15,
  })
  @IsNumber()
  @Min(0)
  estimatedTime: number;
}

export class CreateBusRouteDto {
  @ApiProperty({
    description: 'Name of the bus route',
    example: 'Route 01: Vincom - Times City',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Description of the route',
    required: false,
    example: 'Direct route connecting Vincom Center and Times City',
  })
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'List of stops in the route',
    type: [RouteStopDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RouteStopDto)
  stops: RouteStopDto[];

  @ApiProperty({
    description: 'Route coordinates',
    type: [PositionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PositionDto)
  routeCoordinates: PositionDto[];

  @ApiProperty({
    description: 'Total distance of route (km)',
    example: 12.5,
  })
  @IsNumber()
  @Min(0)
  totalDistance: number;

  @ApiProperty({
    description: 'Estimated duration (minutes)',
    example: 45,
  })
  @IsNumber()
  @Min(0)
  estimatedDuration: number;

  @ApiProperty({
    description: 'Vehicle category ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  vehicleCategory: string;

  @ApiProperty({
    description: 'Route status',
    enum: ['active', 'inactive'],
    example: 'active',
  })
  @IsEnum(['active', 'inactive'])
  status: string;
}

export class UpdateBusRouteDto {
  @ApiProperty({
    description: 'Name of the bus route',
    required: false,
    example: 'Route 01: Vincom - Times City',
  })
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Description of the route',
    required: false,
    example: 'Direct route connecting Vincom Center and Times City',
  })
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'List of stops in the route',
    required: false,
    type: [RouteStopDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RouteStopDto)
  stops?: RouteStopDto[];

  @ApiProperty({
    description: 'Route coordinates',
    required: false,
    type: [PositionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PositionDto)
  routeCoordinates?: PositionDto[];

  @ApiProperty({
    description: 'Total distance of route (km)',
    required: false,
    example: 12.5,
  })
  @IsNumber()
  @Min(0)
  totalDistance?: number;

  @ApiProperty({
    description: 'Estimated duration (minutes)',
    required: false,
    example: 45,
  })
  @IsNumber()
  @Min(0)
  estimatedDuration?: number;

  @ApiProperty({
    description: 'Vehicle category ID',
    required: false,
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  vehicleCategory?: string;

  @ApiProperty({
    description: 'Route status',
    required: false,
    enum: ['active', 'inactive'],
    example: 'active',
  })
  @IsEnum(['active', 'inactive'])
  status?: string;
}
