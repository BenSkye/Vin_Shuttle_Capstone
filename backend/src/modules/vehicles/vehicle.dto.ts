import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export interface ICreateVehicle {
    name: string,
    categoryId: string,
    licensePlate: string,
    isActive?: string,
    status?: string
}

export interface IUpdateVehicle {
    name?: string,
    categoryId?: string,
    licensePlate?: string,
    isActive?: string,
    status?: string
}

export class CreateVehicleDto {
    @ApiProperty({ example: 'Xe điện 4 chỗ A01' })
    name: string;

    @ApiProperty({ example: '507f1f77bcf86cd799439011' })
    categoryId: string;

    @ApiProperty({ example: '888.88' })
    licensePlate: string;

    @ApiPropertyOptional({ example: 'true' })
    isActive: string;

    @ApiPropertyOptional({ example: 'available' })
    status: string;
}


export class UpdateVehicleDto {
    @ApiPropertyOptional({ example: 'Xe điện 4 chỗ A01' })
    name: string;

    @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011' })
    categoryId: string;

    @ApiPropertyOptional({ example: '888.88' })
    licensePlate: string;

    @ApiPropertyOptional({ example: 'true' })
    isActive: string;

    @ApiPropertyOptional({ example: 'available' })
    status: string;
}