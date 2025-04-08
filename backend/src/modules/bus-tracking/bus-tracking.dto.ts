import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateLocationDto {
  @ApiProperty({
    description: 'Latitude of current position',
    example: 21.028511
  })
  @IsNumber()
  latitude: number;

  @ApiProperty({
    description: 'Longitude of current position',
    example: 105.804817
  })
  @IsNumber()
  longitude: number;

  @ApiProperty({
    description: 'Current speed in km/h',
    example: 35
  })
  @IsNumber()
  @IsOptional()
  speed?: number;

  @ApiProperty({
    description: 'Heading in degrees',
    example: 180
  })
  @IsNumber()
  @IsOptional()
  heading?: number;
}

export interface IBusLocation {
  latitude: number;
  longitude: number;
  timestamp: Date;
  speed?: number;
  heading?: number;
}
