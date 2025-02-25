import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleCondition, VehicleOperationStatus } from 'src/share/enums/vehicle.enum';

export interface ICreateVehicle {
  name: string;
  categoryId: string;
  licensePlate: string;
  image?: string[];
  operationStatus?: VehicleOperationStatus;
  vehicleCondition?: VehicleCondition;
}

export interface IUpdateVehicle {
  name?: string;
  categoryId?: string;
  licensePlate?: string;
  image?: string[];
  operationStatus?: VehicleOperationStatus;
  vehicleCondition?: VehicleCondition;
}

export class CreateVehicleDto {
  @ApiProperty({ example: 'Xe điện 4 chỗ A01' })
  name: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  categoryId: string;

  @ApiProperty({ example: '888.88' })
  licensePlate: string;

  @ApiProperty({ example: '' })
  image: string[];

  @ApiPropertyOptional({ example: VehicleOperationStatus.CHARGING })
  operationStatus: string;

  @ApiPropertyOptional({ example: VehicleCondition.AVAILABLE })
  vehicleCondition: string;
}

export class UpdateVehicleDto {
  @ApiPropertyOptional({ example: 'Xe điện 4 chỗ A01' })
  name: string;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011' })
  categoryId: string;

  @ApiPropertyOptional({ example: '888.88' })
  licensePlate: string;

  @ApiProperty({ example: '' })
  image: string[];

  @ApiPropertyOptional({ example: VehicleOperationStatus.CHARGING })
  operationStatus: string;

  @ApiPropertyOptional({ example: VehicleCondition.AVAILABLE })
  vehicleCondition: string;
}
