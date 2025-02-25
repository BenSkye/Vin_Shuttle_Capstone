import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export interface ICreateVehicleCategoryDto {
  name: string;
  description: string;
  numberOfSeat: number;
}

export interface IUpdateVehicleCategoryDto {
  name?: string;
  description?: string;
  numberOfSeat?: number;
}

export class CreateVehicleCategoryDto {
  @ApiProperty({
    description: 'Tên danh mục xe',
    example: 'Xe 4 chỗ',
    minLength: 2,
    maxLength: 100,
  })
  name: string;

  @ApiProperty({
    description: 'Mô tả danh mục',
    example: 'Danh mục xe 4 chỗ thông thường',
    required: false,
  })
  description: string;

  @ApiProperty({
    description: 'Số ghế',
    example: 4,
    minimum: 1,
    maximum: 100,
  })
  numberOfSeat: number;
}

export class UpdateVehicleCategoryDto {
  @ApiPropertyOptional({
    description: 'Tên danh mục xe',
    example: 'Xe 4 chỗ',
    minLength: 2,
    maxLength: 100,
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'Mô tả danh mục',
    example: 'Danh mục xe 4 chỗ thông thường',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Số ghế',
    example: 4,
    minimum: 1,
    maximum: 100,
  })
  numberOfSeat?: number;
}
